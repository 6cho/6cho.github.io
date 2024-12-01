import { Component, HostBinding, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'], // Corrected from 'styleUrl' to 'styleUrls'
})
export class NavigationComponent {
  @HostBinding('class') class = 'component navigation';

  @Input() routes: any[] = [];

  url: string = '';

  constructor(private readonly router: Router) {}

  getIconActiveClass(page: string): string {
    this.url = this.router.url === '/' ? '/home' : this.router.url;

    return this.url.includes(page) ? 'active' : '';
  }

  navigateURL(path: string) {
    this.router.navigate([path]);
  }
  getResume() {}
}
