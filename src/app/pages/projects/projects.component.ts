import { Component } from '@angular/core';
import { TextTestComponent } from '../../components/text-test/text-test.component';
import { LandingComponent } from '../../components/landing/landing.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [LandingComponent, TextTestComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  public title: string = 'Projects';
  public subtitles: string[] = ['Front End / Full Stack', 'Hackathons'];
}
