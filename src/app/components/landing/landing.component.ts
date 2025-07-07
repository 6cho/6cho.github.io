import { Component, Input } from '@angular/core';

@Component({
  selector: 'landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  @Input() data: any = {};

  ngOnInit() {
    let title = this.data.title;
    this.data.title = title.toUpperCase();
  }
}
