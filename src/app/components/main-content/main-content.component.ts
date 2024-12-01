import { Component, HostBinding, HostListener } from '@angular/core';
import { TextTestComponent } from '../text-test/text-test.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'main-content',
  standalone: true,
  imports: [TextTestComponent, CommonModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent {
  @HostBinding('class') class = 'component main-content';

  public scrolled = false;

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    this.scrolled = scrollTop >= 400;
  }
}
