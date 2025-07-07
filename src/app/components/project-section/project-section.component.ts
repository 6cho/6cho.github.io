import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'project-section',
  standalone: true,
  imports: [],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.scss',
})
export class TextSectionComponent {
  @HostBinding('class') class = 'component text-section';
  @Input() data: any = {};
}
