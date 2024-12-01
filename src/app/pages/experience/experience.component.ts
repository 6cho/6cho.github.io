import { Component } from '@angular/core';
import { TextTestComponent } from '../../components/text-test/text-test.component';
import { LandingComponent } from '../../components/landing/landing.component';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [LandingComponent, TextTestComponent],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  public title: string = 'Experience';
  public subtitles: string[] = [
    'Mid Level Front End Developer | PrismHr',
    'Front End Developer | Perficient',
  ];
}
