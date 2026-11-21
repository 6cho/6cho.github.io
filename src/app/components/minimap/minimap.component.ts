import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

/** Inner padding of the map, in px. */
const PAD = 8;
/** The map's only ink: a light grey, used at low strengths so it stays quiet. */
const G = (a: number) => `rgba(170, 172, 178, ${a})`;
/** At most this many main-screen heights fit in the map at once. */
const SCREENS = 3;

/** One shape on the map, in page (scroll content) coordinates. */
interface Block {
  kind: 'hero' | 'card' | 'rule' | 'line' | 'title' | 'lens' | 'sub' | 'chevron' | 'dot';
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A second, small screen in the rail that shows the whole current page in
 * miniature (like an editor's minimap), with a window marking what's visible
 * on the main screen. Click or drag on it to scroll there.
 */
@Component({
  selector: 'minimap',
  standalone: true,
  template: `
    <div class="minimap">
      <canvas
        #canvas
        class="minimap__canvas"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="dragging = false"
        (pointercancel)="dragging = false"
        (wheel)="onWheel($event)"
        aria-hidden="true"
      ></canvas>
      <!-- Indicator: a glass tab latched to the screen's left edge, with a glowing
           line. Lives inside the screen, clipped to the glass. -->
      <div #slider class="minimap__slider" aria-hidden="true">
        <span class="minimap__lens"><i class="minimap__led"></i></span>
      </div>
      <!-- Footer strip: scroll percentage and back-to-top. -->
      <div class="minimap__footer">
        <span #percent class="minimap__percent" aria-hidden="true">0%</span>
        <button #topBtn class="minimap__top" type="button" disabled aria-label="Back to top" (click)="toTop($event)">
          <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
        </button>
      </div>
      <div class="minimap__glass"></div>
    </div>
  `,
  styleUrl: './minimap.component.scss',
})
export class MinimapComponent {
  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('slider') private sliderRef?: ElementRef<HTMLElement>;
  @ViewChild('percent') private percentRef?: ElementRef<HTMLElement>;
  @ViewChild('topBtn') private topRef?: ElementRef<HTMLButtonElement>;

  dragging = false;
  /** Current tab position on the canvas (set while drawing). */
  private markerTop = 0;
  private markerH = 28;
  /** Pointer offset from the tab's center while dragging it. */
  private grabOffset = 0;

  private blocks: Block[] = [];
  private pageH = 1;
  private pageW = 1;
  private scroller?: HTMLElement;
  private frame = 0;

  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.scroller = document.querySelector('.main-content__inner') as HTMLElement | undefined;
      if (!this.scroller) return;
      const scroller = this.scroller;

      const onScroll = () => this.queueDraw();
      const relayout = () => {
        this.measure();
        this.queueDraw();
      };

      this.zone.runOutsideAngular(() => {
        scroller.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', relayout);

        // Page height changes (images loading, fonts) -> re-measure.
        const sizes = new ResizeObserver(relayout);
        const observeContent = () => {
          sizes.disconnect();
          sizes.observe(scroller);
          Array.from(scroller.children).forEach((c) => sizes.observe(c));
        };
        observeContent();

        // Theme changes swap the accent color.
        const theme = new MutationObserver(() => this.queueDraw());
        theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const nav = this.router.events.subscribe((e) => {
          if (e instanceof NavigationEnd) {
            // Wait for the new page to render, then again once it settles.
            setTimeout(() => {
              observeContent();
              relayout();
            }, 50);
            setTimeout(relayout, 900);
          }
        });

        destroyRef.onDestroy(() => {
          scroller.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', relayout);
          sizes.disconnect();
          theme.disconnect();
          nav.unsubscribe();
          cancelAnimationFrame(this.frame);
        });
      });

      relayout();
    });
  }

  /** Map a pointer position to a scroll position, centering the window there. */
  onPointerDown(e: PointerEvent) {
    this.dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    // Grabbing the tab keeps the grab point under the pointer; clicking
    // elsewhere centers the tab on the pointer.
    const py = e.clientY - canvas.getBoundingClientRect().top;
    const onTab = py >= this.markerTop && py <= this.markerTop + this.markerH;
    this.grabOffset = onTab ? py - (this.markerTop + this.markerH / 2) : 0;
    this.scrollTo(e);
  }
  /** Wheel over the map scrolls the main screen, like a scrollbar. */
  onWheel(e: WheelEvent) {
    if (!this.scroller) return;
    e.preventDefault();
    const step = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? this.scroller.clientHeight : 1;
    this.scroller.scrollTop += e.deltaY * step;
  }

  onPointerMove(e: PointerEvent) {
    if (this.dragging) this.scrollTo(e);
  }

  /** Move the tab to the pointer: its position maps straight to scroll progress. */
  private scrollTo(e: PointerEvent) {
    const canvas = this.canvasRef?.nativeElement;
    const s = this.scroller;
    if (!canvas || !s) return;
    const rect = canvas.getBoundingClientRect();
    const travel = Math.max(1, rect.height - PAD - this.markerH);
    const center = e.clientY - rect.top - this.grabOffset;
    const progress = (center - this.markerH / 2 - PAD / 2) / travel;
    s.scrollTop = Math.min(1, Math.max(0, progress)) * (s.scrollHeight - s.clientHeight);
  }
  /** Read the page's layout into simple shapes. */
  private measure() {
    const s = this.scroller;
    if (!s) return;
    const base = s.getBoundingClientRect();
    const top = s.scrollTop;
    const at = (el: Element): Omit<Block, 'kind'> => {
      const r = el.getBoundingClientRect();
      return { x: r.left - base.left, y: r.top - base.top + top, w: r.width, h: r.height };
    };

    const blocks: Block[] = [];
    // The hero as it's seen at the top of the page: the circle (ring + dots
    // inside it), the title, subtitles, chevron and the four corner dots;
    // not the full dot grid built behind the screen.
    const screen = s.closest('.main-content') as HTMLElement | null;
    const css = screen ? getComputedStyle(screen) : null;
    // --aperture is a calc() string, so derive the ring's diameter the same way:
    // the screen's narrow inner side, less --ring-inset on each side.
    const ringInset = css ? parseFloat(css.getPropertyValue('--ring-inset')) : NaN;
    const aperture =
      screen && ringInset > 0 ? Math.min(screen.clientWidth, screen.clientHeight) - 2 * ringInset : NaN;
    const canvas = s.querySelector('.landing__display-canvas') as HTMLElement | null;
    if (canvas && aperture > 0) {
      const r = aperture / 2;
      const cx = s.clientWidth / 2;
      const cy = s.clientHeight / 2;
      blocks.push({ kind: 'lens', x: cx - r, y: cy - r, w: 2 * r, h: 2 * r });

      // Title row: row 8 of the grid (rows are 60px of the 650px-tall canvas),
      // as wide as the title's characters out of 16 cells.
      const c = canvas.getBoundingClientRect();
      const k = c.height / 650;
      const chars = (s.querySelector('.landing__sr-only')?.textContent ?? '').trim().length || 8;
      const tw = (chars * 60 - 10) * k;
      blocks.push({ kind: 'title', x: cx - tw / 2, y: c.top - base.top + top + 7 * 60 * k, w: tw, h: 50 * k });

      s.querySelectorAll('.landing__sub-header p').forEach((p) => {
        const b = at(p);
        blocks.push({ kind: 'sub', x: b.x, y: b.y + b.h * 0.3, w: b.w, h: b.h * 0.4 });
      });
      const next = s.querySelector('.landing__next');
      if (next) blocks.push({ kind: 'chevron', ...at(next) });

      // Corner dots sit on the screen, not the content: page-top positions.
      screen?.querySelectorAll('.corner').forEach((el) => {
        const b = el.getBoundingClientRect();
        blocks.push({ kind: 'dot', x: b.left - base.left, y: b.top - base.top, w: 6, h: 6 });
      });
    } else {
      s.querySelectorAll('.landing__display, .landing__header > h2').forEach((el) =>
        blocks.push({ kind: 'hero', ...at(el) }),
      );
    }
    s.querySelectorAll('.project-group__header').forEach((el) => blocks.push({ kind: 'rule', ...at(el) }));
    s.querySelectorAll('.text-section, .project').forEach((card) => {
      blocks.push({ kind: 'card', ...at(card) });
      // Text inside, drawn as one stripe per line.
      card.querySelectorAll('h3, p, li, .project__gallery').forEach((t) => {
        const b = at(t);
        if (t.classList.contains('project__gallery')) {
          blocks.push({ kind: 'hero', ...b });
          return;
        }
        const lh = parseFloat(getComputedStyle(t).lineHeight) || 20;
        const lines = Math.max(1, Math.round(b.h / lh));
        for (let i = 0; i < lines; i++) {
          const w = i === lines - 1 && lines > 1 ? b.w * 0.6 : b.w;
          blocks.push({ kind: 'line', x: b.x, y: b.y + i * lh + lh * 0.3, w, h: lh * 0.4 });
        }
      });
    });

    this.blocks = blocks;
    this.pageH = Math.max(s.scrollHeight, 1);
    this.pageW = Math.max(s.clientWidth, 1);
  }

  /**
   * Readable scale, like an editor minimap: at most SCREENS main-screen
   * heights fit in the map at once (and never wider than the map). Pages short
   * enough to fit entirely get a stationary map.
   */
  private scale(w: number, h: number) {
    const view = this.scroller?.clientHeight || 720;
    const widthFit = (w - 2 * PAD) / this.pageW;
    const wholeFit = (h - 2 * PAD) / this.pageH;
    const readable = (h - 2 * PAD) / (view * SCREENS);
    return Math.min(widthFit, Math.max(wholeFit, readable));
  }

  /**
   * Vertical offset. If the page fits, the map is centered and stationary.
   * Otherwise it scrolls in step with the main screen: as the indicator moves
   * from the top of the map to the bottom, the map content slides up behind it.
   */
  private offsetY(h: number, scale: number) {
    const s = this.scroller;
    const contentH = this.pageH * scale;
    if (!s || contentH + 2 * PAD <= h) return (h - contentH) / 2;
    const max = Math.max(1, s.scrollHeight - s.clientHeight);
    return PAD - (s.scrollTop / max) * (contentH + 2 * PAD - h);
  }
  private queueDraw() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.draw());
  }

  private draw() {
    const canvas = this.canvasRef?.nativeElement;
    const s = this.scroller;
    if (!canvas || !s) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const scale = this.scale(w, h);
    const ox = (w - this.pageW * scale) / 2;
    const oy = this.offsetY(h, scale);
    const X = (v: number) => ox + v * scale;
    const Y = (v: number) => oy + v * scale;

    for (const b of this.blocks) {
      const x = X(b.x);
      const y = Y(b.y);
      const bw = Math.max(1, b.w * scale);
      const bh = Math.max(1, b.h * scale);
      switch (b.kind) {
        case 'hero': {
          // A faint dot field.
          ctx.fillStyle = G(0.07);
          const step = 3;
          for (let yy = y; yy < y + bh; yy += step) {
            for (let xx = x; xx < x + bw; xx += step) ctx.fillRect(xx, yy, 1, 1);
          }
          break;
        }
        case 'lens': {
          // Dots only inside the circle (fading at its edge), then the ring.
          const cx = x + bw / 2;
          const cy = y + bh / 2;
          const r = bw / 2;
          const inner = r * 0.86;
          const step = 3;
          for (let yy = cy - inner; yy < cy + inner; yy += step) {
            for (let xx = cx - inner; xx < cx + inner; xx += step) {
              const d = Math.hypot(xx - cx, yy - cy) / inner;
              if (d > 1) continue;
              ctx.fillStyle = G(0.08 * Math.min(1, (1 - d) * 4));
              ctx.fillRect(xx, yy, 1, 1);
            }
          }
          ctx.strokeStyle = G(0.22);
          ctx.lineWidth = Math.max(1, 3 * scale * 2);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'title':
          ctx.fillStyle = G(0.3);
          ctx.fillRect(x, y, bw, Math.max(2, bh));
          break;
        case 'sub':
          ctx.fillStyle = G(0.16);
          ctx.fillRect(x, y, bw, Math.max(1, bh));
          break;
        case 'chevron':
          ctx.strokeStyle = G(0.18);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x + bw / 2, y + bh / 2, Math.max(2, bw / 2), 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'dot':
          ctx.fillStyle = G(0.3);
          ctx.fillRect(x, y, 2, 2);
          break;
        case 'card':
          ctx.strokeStyle = G(0.09);
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
          break;
        case 'rule':
          ctx.fillStyle = G(0.2);
          ctx.fillRect(x, y, bw, 1);
          break;
        case 'line':
          ctx.fillStyle = G(0.14);
          ctx.fillRect(x, y, bw, Math.max(1, bh));
          break;
      }
    }

    // The visible window.
    let vy = Y(s.scrollTop);
    let vh = Math.max(4, s.clientHeight * scale);
    // The window is an asymmetric tab: latched flush to the left edge (square
    // corners, accent bar) and hanging short of the right edge (rounded).
    // Everything outside the tab is dimmed, including the gap to its right.
    // A slim, generalized marker centered on the visible area (not its exact
    // size): 28px tall, kept inside the map.
    const MARKER = 28;
    // Travel the map's full height: top of the map at the top of the page,
    // bottom of the map at the end, by scroll progress.
    const maxScroll = Math.max(1, s.scrollHeight - s.clientHeight);
    const progress = Math.min(1, Math.max(0, s.scrollTop / maxScroll));
    vy = PAD / 2 + progress * (h - PAD - MARKER);
    this.markerTop = vy;
    this.markerH = MARKER;
    vh = MARKER;
    const left = 4;
    const right = w - 18;
    const r = Math.min(8, vh / 2);
    // The un-dimmed area matches the glass lens (7px shorter top and bottom than the grip).
    const ly = vy + 7;
    const lh = vh - 14;
    const tab = new Path2D();
    tab.moveTo(left, ly);
    tab.lineTo(right - r, ly);
    tab.arcTo(right, ly, right, ly + r, r);
    tab.lineTo(right, ly + lh - r);
    tab.arcTo(right, ly + lh, right - r, ly + lh, r);
    tab.lineTo(left, ly + lh);
    tab.closePath();

    // No dimming: the map keeps the same graphite as the main screen; the
    // glass lens marks the spot by brightening what's under it.

    // The slider itself is hardware (a DOM element over the screen, see the
    // template): move it to the marker's spot.
    const slider = this.sliderRef?.nativeElement;
    if (slider) {
      slider.style.transform = `translateY(${Math.round(vy)}px)`;
      slider.style.height = `${vh}px`;
      slider.style.setProperty('--slider-w', `${right}px`);
    }

    // Scroll percentage in the footer.
    const pct = `${Math.round(progress * 100)}%`;
    const label = this.percentRef?.nativeElement;
    if (label && label.textContent !== pct) label.textContent = pct;
    // Already at the top: the back-to-top chevron greys out.
    const btn = this.topRef?.nativeElement;
    if (btn) btn.disabled = s.scrollTop <= 1;
    // The counter is grey at 0% and white once you've scrolled.
    label?.classList.toggle('minimap__percent--active', s.scrollTop > 1);
  }

  /** Back-to-top button: glide the main screen to the top. */
  toTop(event: MouseEvent) {
    if (event.detail) (event.currentTarget as HTMLElement).blur();
    const s = this.scroller;
    if (!s) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    s.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
}
