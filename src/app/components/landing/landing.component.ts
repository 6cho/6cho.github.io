import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';

/**
 * 5x5 dot-matrix font. Each glyph is five rows of five characters:
 * '#' = lit dot, '.' = unlit dot.
 */
const GLYPHS: Record<string, string[]> = {
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  F: ['#####', '#....', '####.', '#....', '#....'],
  G: ['.####', '#....', '#..##', '#...#', '.####'],
  H: ['#...#', '#...#', '#####', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '#####'],
  J: ['..###', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '###..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '####.', '#....', '#....'],
  Q: ['.###.', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  S: ['.####', '#....', '.###.', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'],
  Z: ['#####', '...#.', '..#..', '.#...', '#####'],
  '0': ['.###.', '#..##', '#.#.#', '##..#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '.###.'],
  '2': ['####.', '....#', '.###.', '#....', '#####'],
  '3': ['####.', '....#', '.###.', '....#', '####.'],
  '4': ['#..#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '####.'],
  '6': ['.###.', '#....', '####.', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '..#..'],
  '8': ['.###.', '#...#', '.###.', '#...#', '.###.'],
  '9': ['.###.', '#...#', '.####', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....'],
};

/** Characters the display can flicker through. */
const CHARSET = Object.keys(GLYPHS).filter((c) => c !== ' ');

/** Dot positions in a cell's 25x25 grid: 3px squares on a 5px pitch. */
const DOTS = Array.from({ length: 25 }, (_, i) => ({
  x: 1 + (i % 5) * 5,
  y: 1 + Math.floor(i / 5) * 5,
}));

/** Scroll-out effect tuning. */
const SHIMMER = {
  /**
   * Scroll (px) where the effect starts. 0 = as soon as scrolling begins.
   * (The screen's circle-to-square morph happens at 50px, if you want to sync to it.)
   */
  startPx: 0,
  /** Fraction of the hero's height, past startPx, that the effect plays over. */
  fullAt: 0.7,
  /** Characters fade in from invisible to full over progress 0 -> this. */
  fadeInUntil: 0.5,
  /** Opacity of fully faded-in scrambled characters (blank dots sit at `off`). */
  levels: { off: 0.08, noise: 0.5 },
  /**
   * The name dims from full brightness down to the scrambled characters' level,
   * reaching it when the fade-in is this far along (0-1); after that it matches them.
   */
  nameMatchAt: 0.6,
  /** The whole display then fades out over progress this -> 1. */
  fadeOutFrom: 0.5,
  /**
   * Scroll distance (px) between character changes. Characters only change as
   * the page scrolls; stop scrolling and the display holds still.
   */
  stepPx: 12,
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** How bright a dot is: off (blank), noise (flickering character), or name. */
type Level = 'off' | 'noise' | 'name';

/**
 * The character a cell shows at a given scroll step. Deterministic, so the same
 * scroll position always shows the same characters, forward or back.
 */
function charAt(cell: number, step: number): string {
  let h = Math.imul(cell + 1, 0x9e3779b1) ^ Math.imul(step + 1, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 13;
  return CHARSET[(h >>> 0) % CHARSET.length];
}

/** Cached dot levels per character and role, so unchanged cells keep the same array. */
const levelCache = new Map<string, Level[]>();
function levelsFor(char: string, lit: Level): Level[] {
  const key = char + lit;
  let levels = levelCache.get(key);
  if (!levels) {
    levels = (GLYPHS[char] ?? GLYPHS[' '])
      .join('')
      .split('')
      .map((d) => (d === '#' ? lit : 'off'));
    levelCache.set(key, levels);
  }
  return levels;
}

@Component({
  selector: 'landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  @Input() data: any = {};

  readonly dots = DOTS;

  /**
   * What the 16-wide display shows at rest, one character per cell, row by row.
   * Each line must be exactly 16 characters; spaces are blank cells.
   * The grid's bottom edge sits at 2/3 of the landing height, so the name,
   * near the bottom rows, lands close to the visual center of the screen.
   * Outer cells may run off the lens.
   */
  readonly screen = [
    // Extra rows above run up past the top of the circle.
    '                ',
    '                ',
    '                ',
    '                ',
    '                ',
    '                ',
    '      ERIC      ',
    '      CHO       ',
    '                ',
  ];

  private readonly rest = this.screen.join('').split('');
  private readonly isName = this.rest.map((c) => c !== ' ');
  /** What each cell currently shows. */
  private readonly live = [...this.rest];

  /** Last scroll position drawn. */
  private top = -1;

  /** Opacity of the scrambled characters (fades them in). */
  noiseOpacity = SHIMMER.levels.off;
  /** Opacity of the name (dims to match the scrambled characters). */
  nameOpacity = 1;
  /** Opacity of the whole display (fades it out as the hero leaves). */
  fade = 1;

  /** Every cell as 25 dot levels. */
  cells: Level[][] = this.render();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Browser only: the scroll listener runs outside Angular's zone and
    // redraws just this component. Scroll is the only thing that changes the
    // display; there's no timer.
    afterNextRender(() => {
      if (!this.data.display) return;
      const el: HTMLElement = this.host.nativeElement;
      const scroller = el.closest('.main-content__inner') as HTMLElement | null;
      if (!scroller) return;

      const onScroll = () => this.update(scroller.scrollTop, el.clientHeight);

      this.zone.runOutsideAngular(() => {
        scroller.addEventListener('scroll', onScroll, { passive: true });
        destroyRef.onDestroy(() => scroller.removeEventListener('scroll', onScroll));
      });
      onScroll();
    });
  }

  ngOnInit() {
    let title = this.data.title;
    this.data.title = title.toUpperCase();
  }

  /**
   * Glide the screen to the section after this hero over SCROLL_MS. Scrolling
   * drives the screen's circle-to-square morph and the dot scramble, so they
   * play out along the way. Any manual scroll input cancels the glide.
   */
  /**
   * Hover highlight only counts once the mouse really moves over the button.
   * Content scrolling under a resting cursor fires hover too, which made the
   * button light up when scrolling back to the top.
   */
  hoverArmed = false;

  onNextPointerMove(event: PointerEvent) {
    if (event.movementX || event.movementY) this.hoverArmed = true;
  }

  scrollToNext(event?: MouseEvent) {
    // Drop focus and the hover highlight after a mouse click so the button
    // doesn't stay lit (keyboard users keep their focus ring).
    if (event?.detail) (event.currentTarget as HTMLElement).blur();
    this.hoverArmed = false;

    const el: HTMLElement = this.host.nativeElement;
    const scroller = el.closest('.main-content__inner') as HTMLElement | null;
    const next = el.nextElementSibling as HTMLElement | null;
    if (!scroller || !next) return;

    // Land the section just below the screen's top edge (the 32px masked band).
    const from = scroller.scrollTop;
    const to =
      from + next.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 32;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scroller.scrollTop = to;
      return;
    }

    const SCROLL_MS = 1000;
    // Ease in-out cubic: gentle start, smooth glide, soft landing.
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const start = performance.now();
    let frame = 0;

    const cancel = () => {
      cancelAnimationFrame(frame);
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((type) =>
        scroller.removeEventListener(type, cancel),
      );
    };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((type) =>
      scroller.addEventListener(type, cancel, { passive: true }),
    );

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / SCROLL_MS);
      scroller.scrollTop = from + (to - from) * ease(t);
      if (t < 1) frame = requestAnimationFrame(step);
      else cancel();
    };
    frame = requestAnimationFrame(step);
  }

  /**
   * Match the display to the scroll position. Once the screen goes square, every
   * blank cell shows a character; they fade in, then the whole display fades out.
   * The scroll step picks the characters, so they move only while scrolling.
   */
  private update(top: number, height: number) {
    if (top === this.top) return;
    this.top = top;

    const started = top >= SHIMMER.startPx;
    const p = clamp01((top - SHIMMER.startPx) / (height * SHIMMER.fullAt || 1));
    const fadeIn = started ? clamp01(p / SHIMMER.fadeInUntil) : 0;
    const { off, noise } = SHIMMER.levels;
    this.noiseOpacity = Math.max(off, noise * fadeIn);
    // Ease the name down to wherever the scramble is, meeting it at nameMatchAt.
    const match = clamp01(fadeIn / SHIMMER.nameMatchAt);
    this.nameOpacity = 1 + (this.noiseOpacity - 1) * match;
    this.fade = 1 - clamp01((p - SHIMMER.fadeOutFrom) / (1 - SHIMMER.fadeOutFrom));

    const step = Math.floor(top / SHIMMER.stepPx);
    this.live.forEach((_, i) => {
      if (this.isName[i]) return;
      this.live[i] = started ? charAt(i, step) : ' ';
    });
    this.redraw();
  }

  private redraw() {
    this.cells = this.render();
    this.cdr.detectChanges();
  }

  private render(): Level[][] {
    return this.live.map((char, i) => levelsFor(char, this.isName[i] ? 'name' : 'noise'));
  }
}
