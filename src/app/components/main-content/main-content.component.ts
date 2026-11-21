import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgZone,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/** On <html> while the screen's content is faded out for a page change. */
export const PAGE_LEAVING = 'page-leaving';
/** Hide without the fade-out (back/forward navigation). */
const PAGE_INSTANT = 'page-instant';
/** On <html> while the new page opens (desktop shutter reopening). */
const PAGE_ENTERING = 'page-entering';
/** Must match the fade duration in styles.scss (tablet / phone). */
export const PAGE_FADE_MS = 220;
/** Must match the shutter close in main-content.component.scss (desktop). */
export const SHUTTER_CLOSE_MS = 480;
/** Shutter reopen, including the brackets fading out. */
const SHUTTER_OPEN_MS = 850;
/**
 * When to swap pages. The content is fully faded by ~400ms (the circle is still
 * closing, unseen), so swapping here leaves ~0.2s of blank screen before the
 * new page fades in.
 */
const SHUTTER_SWAP_MS = 440;

/** How long to wait for the current page to leave before navigating. */
export function pageLeaveMs(): number {
  return document.documentElement.classList.contains('bp-desk') ? SHUTTER_SWAP_MS : PAGE_FADE_MS;
}
import { DynamicCornersComponent } from '../dynamic-corners/dynamic-corners.component';

@Component({
  selector: 'main-content',
  standalone: true,
  imports: [CommonModule, DynamicCornersComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent {
  @HostBinding('class') class = 'component main-content';
  @Input() scroll: number = 0;
  public scrolled = false;
  @Output() scrollChange: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('innerContent') innerContent!: ElementRef;

  private readonly router = inject(Router);

  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private enterTimer?: ReturnType<typeof setTimeout>;


  ngOnChanges(changes: SimpleChanges) {
    // Positions set from outside (e.g. the nav resetting to 0).
    if (changes['scroll'] && !changes['scroll'].firstChange && this.innerContent) {
      this.innerContent.nativeElement.scrollTop = changes['scroll'].currentValue;
    }
  }

  ngAfterViewInit() {
    const el: HTMLElement = this.innerContent.nativeElement;
    // Scroll is handled outside Angular's zone: a scroll event no longer
    // re-checks the whole app (including the 2,400-dot display). This view is
    // only re-rendered when something it shows actually changes.
    this.zone.runOutsideAngular(() => {
      el.addEventListener('scroll', () => this.onScroll(), { passive: true });
    });
    // Page changes fade the screen's content. Nav keys fade it out first (see
    // NavigationComponent); back/forward just hide it instantly. Either way the
    // new page starts at the top and fades in once it has rendered.
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart && !root.classList.contains(PAGE_LEAVING)) {
        root.classList.add(PAGE_LEAVING, PAGE_INSTANT);
      }
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
        el.scrollTop = 0;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            root.classList.remove(PAGE_LEAVING, PAGE_INSTANT);
            root.classList.add(PAGE_ENTERING);
            clearTimeout(this.enterTimer);
            this.enterTimer = setTimeout(() => root.classList.remove(PAGE_ENTERING), SHUTTER_OPEN_MS);
          }),
        );
      }
    });
  }

  private onScroll() {
    const top = (this.innerContent.nativeElement as HTMLElement).scrollTop;
    this.scroll = top;

    // Hysteresis: open at 50px, only close again near the top, so scrolling
    // around the threshold doesn't restart the morph back and forth.
    const scrolled = this.scrolled ? top > 20 : top >= 50;
    if (scrolled !== this.scrolled) {
      this.scrolled = scrolled;
      this.cdr.detectChanges();
    }
  }
}
