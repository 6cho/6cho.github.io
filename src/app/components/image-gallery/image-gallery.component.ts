import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'image-gallery',
  standalone: true,
  imports: [],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
})
export class ImageGalleryComponent implements OnInit {
  @HostBinding('class') class = 'component image-gallery';
  @Input() images: any = [];

  activeImage?: any;
  activeIndex = 0;

  ngOnInit(): void {
    if (this.images.length === 0) return;

    this.activeImage = this.images[0];
  }
}
