import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'image-gallery',
  standalone: true,
  imports: [],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
})
export class ImageGalleryComponent {
  @HostBinding('class') class = 'component image-gallery';
  @Input() images: { src: string; alt: string }[] = [];

  activeIndex = 0;

  get activeImage() {
    return this.images[this.activeIndex];
  }

  prev() {
    this.go(this.activeIndex - 1);
  }

  next() {
    this.go(this.activeIndex + 1);
  }

  go(index: number) {
    const count = this.images.length;
    this.activeIndex = ((index % count) + count) % count;
  }
}
