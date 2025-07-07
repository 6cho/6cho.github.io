import { Component, HostBinding, Input } from '@angular/core';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';

@Component({
  selector: 'text-section',
  standalone: true,
  imports: [ImageGalleryComponent],
  templateUrl: './text-section.component.html',
  styleUrl: './text-section.component.scss',
})
export class TextSectionComponent {
  @HostBinding('class') class = 'component text-section';
  @Input() data: any = {};
}
