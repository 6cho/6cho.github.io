import { Component, Input } from '@angular/core';

/**
 * The screen's four corner pieces. Always present; they change form:
 *   at rest (top of a page)   white dots in each corner
 *   scrolled into content     brackets framing the screen
 *   page change (desktop)     dots that stretch into diagonal lines trailing
 *                             the closing circle, then retract as it reopens
 * Page-change states come from classes on <html> (page-leaving / page-entering,
 * see MainContentComponent), so this only needs to know about scroll.
 */
@Component({
  selector: 'dynamic-corners',
  standalone: true,
  imports: [],
  templateUrl: './dynamic-corners.component.html',
  styleUrl: './dynamic-corners.component.scss',
})
export class DynamicCornersComponent {
  /** The screen has opened into content (shows brackets instead of dots). */
  @Input() scrolled = false;
}
