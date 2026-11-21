import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
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

/** Each glyph as 25 lit/unlit dots, row by row. */
const GLYPH_BITS: Record<string, boolean[]> = Object.fromEntries(
  Object.entries(GLYPHS).map(([c, rows]) => [c, rows.join('').split('').map((d) => d === '#')]),
);

/**
 * Display geometry, in CSS px. A cell is a 25-unit grid at 2px per unit
 * (whole pixels at both 1x and 1.5x): 3-unit dots on a 5-unit pitch, with a
 * one-dot gap between cells.
 */
const MATRIX = { cols: 16, cell: 50, gap: 10, unit: 2, dot: 3, pitch: 5, inset: 1 };
const COLOR = '240, 240, 240';

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
  // `rest` is the scramble's brightness at the top of the page: faintly
  // visible behind the title, then it fades up toward `noise` on scroll.
  levels: { off: 0.08, rest: 0.12, noise: 0.5 },
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

/**
 * The character a cell shows at a given scroll step. Deterministic, so the same
 * scroll position always shows the same characters, forward or back.
 */
function charAt(cell: number, step: number): string {
  let h = Math.imul(cell + 1, 0x9e3779b1) ^ Math.imul(step + 1, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 13;
  // At the very top (first scroll step) the display shows only digits.
  const set = step === 0 ? DIGITS : CHARSET;
  return set[(h >>> 0) % set.length];
}

const DIGITS = CHARSET.filter((c) => c >= '0' && c <= '9');

@Component({
  selector: 'landing',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  @Input() data: any = {};

  @ViewChild('matrix') private matrix?: ElementRef<HTMLCanvasElement>;
  @ViewChild('header') private header?: ElementRef<HTMLElement>;

  /**
   * What the 16-wide display shows at rest, one character per cell, row by row.
   * Built from the page title in ngOnInit (see buildScreen): blank rows above
   * run up past the top of the lens, two title rows sit near the screen's
   * visual center, and blank rows below carry the grid down to ~3/4.
   */
  screen: string[] = [];

  private rest: string[] = [];
  private isName: boolean[] = [];
  /** What each cell currently shows. */
  private live: string[] = [];

  /** Blank columns right of the title block; the subtitles align to its edge. */
  nameRightCols = 6;
  /** Horizontal nudge (px) so odd-width titles sit centered in the lens. */
  shift = 0;
  /** Title width in cells. */
  private titleCells = 4;
  /** Wide titles center their subtitles; right-aligned ones would hit the lens edge. */
  get centerSubtitles(): boolean {
    return this.titleCells > 6;
  }

  @ViewChild('display') private display?: ElementRef<HTMLElement>;

  /** Every landing shows the dot display unless a page opts out. */
  get showDisplay(): boolean {
    return this.data?.display !== false;
  }

  /** Last scroll position drawn. */
  private top = -1;

  /** Opacity of the scrambled characters (fades them in). */
  noiseOpacity = SHIMMER.levels.rest;
  /** Opacity of the name (dims to match the scrambled characters). */
  nameOpacity = 1;
  /** Opacity of the whole display (fades it out as the hero leaves). */
  fade = 1;

  /** Display size in CSS px. */
  readonly width = MATRIX.cols * MATRIX.cell + (MATRIX.cols - 1) * MATRIX.gap;
  height = 0;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Browser only: the scroll listener runs outside Angular's zone and
    // redraws just this component. Scroll is the only thing that changes the
    // display; there's no timer.
    afterNextRender(() => {
      if (!this.showDisplay) return;
      const el: HTMLElement = this.host.nativeElement;
      const scroller = el.closest('.main-content__inner') as HTMLElement | null;
      if (!scroller) return;

      // Coalesce scroll events into at most one redraw per animation frame.
      let queued = false;
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          this.update(scroller.scrollTop, el.clientHeight);
        });
      };

      // Re-size the canvas backing store if the pixel ratio changes (zoom,
      // moving to another monitor).
      const onResize = () => {
        this.sizeCanvas();
        this.draw();
        this.fitTitle(scroller.clientWidth);
      };

      this.zone.runOutsideAngular(() => {
        scroller.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        destroyRef.onDestroy(() => {
          scroller.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onResize);
        });
      });
      this.sizeCanvas();
      this.draw();
      this.fitTitle(scroller.clientWidth);
      onScroll();
    });
  }

  ngOnInit() {
    let title = this.data.title;
    this.data.title = title.toUpperCase();
    this.buildScreen(this.data.title);
  }

  /**
   * Lay the title out on the grid as a single row centered in the 16 columns,
   * e.g. "ERIC CHO" (8 cells) or "EXPERIENCE" (10 cells).
   */
  private buildScreen(title: string) {
    const cols = MATRIX.cols;
    const blank = ' '.repeat(cols);
    // The whole title on one line (spaces become blank cells), up to 16 cells.
    const line = title.trim().replace(/\s+/g, ' ').slice(0, cols);
    const width = Math.max(1, line.length);
    const start = Math.floor((cols - width) / 2);
    const row = (w = '') => (' '.repeat(start) + w).padEnd(cols).slice(0, cols);

    // 6 rows above, a spare row, the title row, then 3 below (matches
    // --rows-below). The title sits on the lower row, closer to center.
    this.screen = [...Array(6).fill(blank), row(), row(line), ...Array(3).fill(blank)];
    this.rest = this.screen.join('').split('');
    this.isName = this.rest.map((c) => c !== ' ');
    this.live = [...this.rest];
    this.height = this.screen.length * MATRIX.cell + (this.screen.length - 1) * MATRIX.gap;

    this.titleCells = width;
    this.nameRightCols = cols - (start + width);
    // The grid's center falls between columns 7 and 8; nudge odd-width titles
    // half a cell so they read centered in the lens.
    const pitch = MATRIX.cell + MATRIX.gap;
    this.shift = ((cols - 1) / 2 - (start + (width - 1) / 2)) * pitch;
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

    // Land the section so its card (32px inside the section) sits just past
    // the screen's top fade (fully visible from 96px down).
    const from = scroller.scrollTop;
    const to =
      from + next.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 64;

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
    const prev = [this.noiseOpacity, this.nameOpacity, this.fade, this.live.join('')];

    const started = top >= SHIMMER.startPx;
    const p = clamp01((top - SHIMMER.startPx) / (height * SHIMMER.fullAt || 1));
    const fadeIn = started ? clamp01(p / SHIMMER.fadeInUntil) : 0;
    const { rest, noise } = SHIMMER.levels;
    // Rounded to 1/50 steps: invisible difference, far fewer style recalcs
    // across the 2,400 dots.
    const q = (n: number) => Math.round(n * 50) / 50;
    this.noiseOpacity = q(rest + (noise - rest) * fadeIn);
    // Ease the name down to wherever the scramble is, meeting it at nameMatchAt.
    const match = clamp01(fadeIn / SHIMMER.nameMatchAt);
    this.nameOpacity = q(1 + (this.noiseOpacity - 1) * match);
    this.fade = q(1 - clamp01((p - SHIMMER.fadeOutFrom) / (1 - SHIMMER.fadeOutFrom)));

    const step = Math.floor(top / SHIMMER.stepPx);
    this.live.forEach((_, i) => {
      if (this.isName[i]) return;
      this.live[i] = started ? charAt(i, step) : ' ';
    });

    // Fade is applied straight to the element (no change detection).
    if (this.fade !== prev[2] && this.header) {
      this.header.nativeElement.style.opacity = String(this.fade);
    }
    // Skip the redraw entirely when nothing visible on the matrix changed.
    if (
      this.noiseOpacity !== prev[0] ||
      this.nameOpacity !== prev[1] ||
      this.live.join('') !== prev[3]
    ) {
      this.draw();
    }
  }

  /**
   * Shrink the dot display on screens too narrow for the title (phones), scaling
   * around the title so it stays centered. Full size whenever it fits.
   */
  private fitTitle(screenWidth: number) {
    const el = this.display?.nativeElement;
    const header = this.header?.nativeElement;
    if (!el || !header) return;
    const pitch = MATRIX.cell + MATRIX.gap;
    const titlePx = this.titleCells * pitch - MATRIX.gap;
    // Title center, in the header's coordinates (lens center x, title row y).
    const originX = this.width / 2 - this.shift;
    const originY = 7 * pitch + MATRIX.cell / 2;

    // Desktop: fit the whole title block (dots, subtitles, chevron) inside
    // the circle aperture, title centered slightly above the circle's middle.
    const screen = this.host.nativeElement.closest('.main-content') as HTMLElement | null;
    if (window.innerWidth > 1000 && screen) {
      // Visible circle radius: half the screen's narrow side, less the ring's
      // inset and the blank gap inside it (CSS vars on .main-content).
      const css = getComputedStyle(screen);
      const ringInset = parseFloat(css.getPropertyValue('--ring-inset')) || 24;
      const ringGap = parseFloat(css.getPropertyValue('--ring-gap')) || 24;
      const r = (Math.min(screen.clientWidth, screen.clientHeight) - 2 * ringInset - 2 * ringGap) / 2;
      const lift = 0.15 * r;
      // ~320px of block below the title center; the title must fit its chord.
      const scale = Math.min(
        1,
        (r - 30 + lift) / 320,
        (2 * Math.sqrt(r * r - lift * lift) - 60) / titlePx,
      );
      const landingH = this.host.nativeElement.clientHeight;
      header.style.top = `${landingH / 2 - lift - originY}px`;
      header.style.bottom = 'auto';
      header.style.transformOrigin = `${originX}px ${originY}px`;
      header.style.transform = scale < 1 ? `scale(${scale})` : '';
      el.style.transform = '';
      header.style.setProperty('--below-lift', '0px');
      return;
    }
    header.style.top = '';
    header.style.bottom = '';
    header.style.transform = '';
    // Tablet / phone: shrink just the dots if the title is wider than the screen.
    const scale = Math.min(1, (screenWidth - 48) / titlePx);
    el.style.transformOrigin = `${originX}px ${originY}px`;
    el.style.transform = scale < 1 ? `scale(${scale})` : '';
    // Scaling doesn't shrink the layout box, so lift the subtitles and chevron
    // by however much the grid below the title row shrank.
    const lift = (this.height - originY) * (1 - scale);
    this.header?.nativeElement.style.setProperty('--below-lift', `${lift}px`);
  }

  /** Match the canvas backing store to its CSS size times the pixel ratio. */
  private sizeCanvas() {
    const canvas = this.matrix?.nativeElement;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(this.width * dpr);
    canvas.height = Math.round(this.height * dpr);
  }

  /** Paint every dot. Batched into one path per brightness level. */
  private draw() {
    const canvas = this.matrix?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = canvas.width / this.width;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    const { cols, cell, gap, unit, dot, pitch, inset } = MATRIX;
    const size = dot * unit;
    const off = new Path2D();
    const noise = new Path2D();
    const name = new Path2D();

    this.live.forEach((char, c) => {
      const bits = GLYPH_BITS[char] ?? GLYPH_BITS[' '];
      const ox = (c % cols) * (cell + gap);
      const oy = Math.floor(c / cols) * (cell + gap);
      const lit = this.isName[c] ? name : noise;
      for (let i = 0; i < 25; i++) {
        const x = ox + (inset + (i % 5) * pitch) * unit;
        const y = oy + (inset + Math.floor(i / 5) * pitch) * unit;
        (bits[i] ? lit : off).rect(x, y, size, size);
      }
    });

    ctx.fillStyle = `rgba(${COLOR}, ${SHIMMER.levels.off})`;
    ctx.fill(off);
    ctx.fillStyle = `rgba(${COLOR}, ${this.noiseOpacity})`;
    ctx.fill(noise);
    ctx.fillStyle = `rgba(${COLOR}, ${this.nameOpacity})`;
    ctx.fill(name);
  }
}
