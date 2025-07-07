import { Component } from '@angular/core';
import { TextTestComponent } from '../../components/text-test/text-test.component';
import { LandingComponent } from '../../components/landing/landing.component';
import { TextSectionComponent } from '../../components/text-section/text-section.component';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [LandingComponent, TextSectionComponent],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
})
export class EducationComponent {
  public titleData = {
    title: 'Education',
    subtitles: [
      'University of Georgia',
      "Bachelor's Degree in Computer Science",
    ],
  };

  public educationData = [
    {
      type: 'title',
      title: 'University of Georgia',
      image: {
        src: 'assets/images/logos/uga.png',
        alt: 'UGA Logo',
        class: 'large',
      },
      subtitle: 'Undergraduate Studies | Aug 2016 - Jul 2020',
    },
    {
      type: 'two-column',
      subtitle: 'Degree',
      text: 'Bachelor of Science in Computer Science',
    },
    {
      type: 'two-column',
      subtitle: 'Emphasis',
      text: 'Internet Information Technology',
    },
    {
      type: 'two-column',
      subtitle: 'Certificate',
      text: 'Applied Data Science',
    },
    {
      type: 'two-column',
      subtitle: 'GPA',
      text: '3.40 / 4.00',
    },
    {
      type: 'two-column',
      subtitle: 'Scholarships',
      text: 'Hope Scholarship, McMullan Study Abroad Scholarship',
    },
    {
      type: 'two-column',
      subtitle: 'Coursework',
      text:
        'Computer Networks, Data Mining, Data Science, Data Structures, Discrete Mathematics, ' +
        'Linear Algebra, Numerical Simulations, Software Development, Systems Programming, ' +
        'Theory of Computation, Web Programming, Computer Architecture, Database Systems',
    },
    {
      type: 'two-column',
      subtitle: 'Events',
      text: 'National University of Singapore Exchange Program (2019), 2nd place winner at UGAHacks5 (2020)',
    },
    {
      type: 'two-column',
      subtitle: 'Organizations',
      text:
        'Asian American Student Association, Association for Computing Machinery, Vietnamese Student ' +
        'Association, Office of Global Engagement, Xi Kappa Fraternity, Incorporated.',
    },
  ];
}
