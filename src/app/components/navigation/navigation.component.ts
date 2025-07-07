import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
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
  @Output() scrollNavigation: EventEmitter<number> = new EventEmitter<number>();

  url: string = '';

  constructor(private readonly router: Router) {}

  getIconActiveClass(page: string): string {
    this.url = this.router.url === '/' ? '/home' : this.router.url;

    return this.url.includes(page) ? 'active' : '';
  }

  navigateURL(path: string) {
    this.scrollNavigation.emit(0);
    this.router.navigate([path]);
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
