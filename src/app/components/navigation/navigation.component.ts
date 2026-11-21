import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MinimapComponent } from '../minimap/minimap.component';
import { Router } from '@angular/router';
import { PAGE_LEAVING, pageLeaveMs } from '../main-content/main-content.component';

@Component({
  selector: 'navigation',
  standalone: true,
  imports: [MinimapComponent],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'], // Corrected from 'styleUrl' to 'styleUrls'
})
export class NavigationComponent {
  @HostBinding('class') class = 'component navigation';

  @Input() routes: any[] = [];
  @Output() scrollNavigation: EventEmitter<number> = new EventEmitter<number>();

  url: string = '';

  /** Dark mode on? Read from <html> (set before paint by index.html). */
  dark = false;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.dark = document.documentElement.classList.contains('theme-dark');
    }
  }

  toggleTheme(event?: MouseEvent) {
    // Drop focus after a mouse click so the focus ring doesn't stick around
    // (keyboard users keep it).
    if (event?.detail) (event.currentTarget as HTMLElement).blur();
    const apply = () => {
      this.dark = !this.dark;
      document.documentElement.classList.toggle('theme-dark', this.dark);
      try {
        localStorage.setItem('theme', this.dark ? 'dark' : 'light');
      } catch {}
      // The view-transition callback runs outside Angular's change detection;
      // render the switch now so the "new" snapshot shows the knob moved.
      this.cdr.detectChanges();
    };

    // Cross-fade the whole page between themes (timing in styles.scss).
    // Falls back to an instant switch without support or with reduced motion.
    // The device is captured as its own layer (theme-switching), so it fades
    // faster than the backdrop behind it.
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (doc.startViewTransition && !reduce) {
      root.classList.add('theme-switching');
      doc
        .startViewTransition(apply)
        .finished.finally(() => root.classList.remove('theme-switching'));
    } else {
      apply();
    }
  }

  /** Social links shown under the nav keys. */
  readonly links = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/6cho/', icon: 'fa-brands fa-linkedin-in' },
    { label: 'GitHub', href: 'https://github.com/6cho', icon: 'fa-brands fa-github' },
  ];

  constructor(private readonly router: Router) {}

  /** Page whose key was just pressed; it shows active before the display changes. */
  private pressed: string | null = null;

  getIconActiveClass(page: string): string {
    if (this.pressed) return this.pressed === page ? 'active' : '';
    this.url = this.router.url === '/' ? '/home' : this.router.url;
    return this.url.includes(page) ? 'active' : '';
  }

  /** Close the screen on the current page (shutter / fade), then navigate; it reopens on arrival. */
  navigateURL(path: string) {
    const root = document.documentElement;
    if (this.router.url === '/' + path || root.classList.contains(PAGE_LEAVING)) return;
    // Press the key first (it sinks and lights now), then the display changes.
    this.pressed = path.split('/').pop() ?? null;
    root.classList.add(PAGE_LEAVING);
    setTimeout(() => {
      this.scrollNavigation.emit(0);
      this.router.navigate([path]).finally(() => (this.pressed = null));
    }, pageLeaveMs());
  }
  getResume() {
    //   const link = document.createElement('a');
    //   link.href = 'assets/resume/Eric%20Cho%20Resume.pdf';
    //   link.download = 'Eric Cho Resume.pdf';
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // }

    // downloadPDF() {
    const link = document.createElement('a');
    link.href = 'assets/resume/Eric Cho Resume.pdf';
    link.download = 'Eric Cho Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
