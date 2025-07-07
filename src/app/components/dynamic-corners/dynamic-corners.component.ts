import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'dynamic-corners',
  standalone: true,
  imports: [],
  templateUrl: './dynamic-corners.component.html',
  styleUrl: './dynamic-corners.component.scss',
})
export class DynamicCornersComponent {
  @Input() scrolled: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scrolled'] && changes['scrolled'].previousValue) {
      this.scrolled = changes['scrolled'].currentValue;
    }
  }
}
