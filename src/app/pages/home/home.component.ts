import { Component } from '@angular/core';
import { TextTestComponent } from '../../components/text-test/text-test.component';
import { LandingComponent } from '../../components/landing/landing.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LandingComponent, TextTestComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public title: string = 'Eric Cho';
  public subtitles: string[] = ['Front End Developer', 'Based in Atlanta, GA'];
}
