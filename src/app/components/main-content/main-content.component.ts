import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'main-content',
  standalone: true,
  imports: [],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent {
  @HostBinding('class') class = 'component main-content';
}
