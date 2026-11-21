import { Component, DestroyRef, HostBinding, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { routes } from './app.routes';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, MainContentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = '6cho.github.io';

  @HostBinding('class') class = 'main';

  routesData: any[] = [];

  scroll: number = 0;

  constructor() {
    // The layout (desktop / tablet / phone) is driven by classes on <html>
    // (set before first paint in index.html). Crossing a breakpoint swaps them
    // inside a view transition, so the device, screen and rail glide into
    // their new layout (see `.layout-morphing` in styles.scss).
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const root = document.documentElement;
      const apply = () => {
        const w = window.innerWidth;
        root.classList.toggle('bp-desk', w > 1000);
        root.classList.toggle('bp-tab', w <= 1000);
        root.classList.toggle('bp-phone', w <= 700);
      };
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      };
      const onCross = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!doc.startViewTransition || reduce || root.classList.contains('theme-switching')) {
          apply();
          return;
        }
        root.classList.add('layout-morphing');
        doc.startViewTransition(apply).finished.finally(() => root.classList.remove('layout-morphing'));
      };
      const queries = ['(max-width: 1000px)', '(max-width: 700px)'].map((q) => window.matchMedia(q));
      queries.forEach((q) => q.addEventListener('change', onCross));
      destroyRef.onDestroy(() => queries.forEach((q) => q.removeEventListener('change', onCross)));
      apply();
    });
  }

  ngOnInit() {
    this.routesData = this.getRoutes() ?? [];
  }

  getRoutes() {
    let routeData = routes[0];

    let root = routeData.path;

    let finalData = routeData.children
      ?.filter((c) => c.path !== '')
      .map((c) => {
        let display = c.path ?? '';
        display = display[0].toUpperCase() + display.substring(1);
        let data = {
          path: root + '/' + c.path,
          page: c.path,
          display: display,
        };
        return data;
      });
    return finalData;
  }

  handleChangeScroll(event: any) {
    this.scroll = event;
  }
}
