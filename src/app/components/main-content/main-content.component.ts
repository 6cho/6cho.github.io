import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
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

  /** Status bar readouts. */
  page = 'HOME';
  percent = '000';
  time = '--:--';

  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const segment = this.router.url.split('/').filter(Boolean).pop();
        this.page = (segment ?? 'home').toUpperCase();
      });

    // Clock only runs in the browser so prerendering isn't held open.
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const tick = () =>
        (this.time = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York',
        }).format(new Date()));
      tick();
      const id = setInterval(tick, 15000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  /** Last scroll position this component reported up via scrollChange. */
  private lastEmitted = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scroll'] && changes['scroll'].previousValue) {
      const value = changes['scroll'].currentValue;
      this.scroll = value;
      // Only apply positions set from outside (e.g. the nav resetting to 0).
      // Writing back our own echoed value would cancel smooth scrolling.
      if (value !== this.lastEmitted) {
        this.innerContent.nativeElement.scrollTop = value;
      }
    }
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    const el = this.innerContent.nativeElement;
    const max = el.scrollHeight - el.clientHeight;
    this.scroll = el.scrollTop;
    this.scrolled = this.scroll >= 50;
    const pct = max > 0 ? Math.round((this.scroll / max) * 100) : 0;
    this.percent = String(Math.min(100, pct)).padStart(3, '0');
    this.lastEmitted = this.scroll;
    this.scrollChange.emit(this.scroll);
  }
}
