import { Component } from '@angular/core';

import { LandingComponent } from '../../components/landing/landing.component';
import { TextSectionComponent } from '../../components/text-section/text-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LandingComponent, TextSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public titleData = {
    title: 'Eric Cho',
    subtitles: ['Front End Developer', 'Based in Atlanta, GA'],
  };

  public introData = [
    {
      type: 'title',
      title: 'Hi :)',
    },
    {
      type: 'text',
      text:
        'My name is Eric Cho and I am an alumni from The University of Georgia with a ' +
        'Bachelors degree in Computer Science. I specialize in Front End software ' +
        'development, and I also have experience with Full Stack technologies.',
    },
    {
      type: 'text',
      text:
        'Since graduating college, I have had the chance to be a part of amazing ' +
        'teams to create online products and solutions used by businesses across the ' +
        'country, and it has helped solidify my focus on creating online experiences ' +
        'to be able to reach and impact more people.',
    },
  ];

  public skillsData = [
    {
      type: 'title',
      title: 'My Skills',
    },
    {
      type: 'text',
      subtitle: 'Coding Languages and Technologies',
      text: 'Angular, React, TypeScript, JavaScript, HTML, CSS, SCSS, Node.js, Express.js, jQuery, C#, Python, Java, SQL, Storybook, Jest',
    },
    {
      type: 'text',
      subtitle: 'Tools',
      text: 'Visual Studio Code, Git, Azure DevOps, Atlassian Jira, Sitecore CMS, Weebly CMS',
    },
  ];

  public linksData = [
    {
      type: 'title',
      title: 'My Links',
      subtitle: 'Come check out my stuff',
    },
    {
      type: 'link',
      text: 'LinkedIn',
      link: 'https://www.linkedin.com/in/6cho/',
      icon: 'fa-brands fa-linkedin',
    },
    {
      type: 'link',
      text: 'GitHub (Personal)',
      link: 'https://github.com/6cho',
      icon: 'fa-brands fa-github',
    },
    {
      type: 'link',
      text: 'GitHub (Work)',
      link: 'https://github.com/ericchoprismhr',
      icon: 'fa-brands fa-github',
    },
  ];
}
