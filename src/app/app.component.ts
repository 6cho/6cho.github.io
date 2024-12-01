import { Component, HostBinding } from '@angular/core';
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
          display: display,
        };
        return data;
      });
    return finalData;
  }
}
