import { Component } from '@angular/core';
import { TextTestComponent } from '../../components/text-test/text-test.component';
import { LandingComponent } from '../../components/landing/landing.component';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [LandingComponent, TextTestComponent],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
})
export class EducationComponent {
  public title: string = 'Education';
  public subtitles: string[] = [
    'University of Georgia',
    "Bachelor's Degee in Computer Science",
  ];
}
