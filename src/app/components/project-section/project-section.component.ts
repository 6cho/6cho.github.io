import { Component, HostBinding, Input } from '@angular/core';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectLink {
  text: string;
  link: string;
  icon: string;
}

export interface Project {
  title: string;
  tech: string;
  description: string[];
  images: ProjectImage[];
  links?: ProjectLink[];
}

@Component({
  selector: 'project-section',
  standalone: true,
  imports: [ImageGalleryComponent],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.scss',
})
export class ProjectSectionComponent {
  @HostBinding('class') class = 'component project-section';
  @Input({ required: true }) project!: Project;
}
