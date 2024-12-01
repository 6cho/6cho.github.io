import { Component, Input } from '@angular/core';

@Component({
  selector: 'landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  @Input() title: string = '';

  @Input() subtitles: string[] = [];

  ngOnInit() {
    this.title = this.title.toUpperCase();
  }
}
