import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  @HostBinding('class') class = 'component navigation';

  @Input() routes = [];
}
