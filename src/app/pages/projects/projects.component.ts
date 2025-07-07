import { Component } from '@angular/core';
import { TextTestComponent } from '../../components/text-test/text-test.component';
import { LandingComponent } from '../../components/landing/landing.component';

import { TextSectionComponent } from '../../components/text-section/text-section.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [LandingComponent, TextTestComponent, TextSectionComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  public titleData = {
    title: 'Projects',
    subtitles: ['Front End', 'Full Stack', 'Hackathons'],
  };

  // title
  // sub title

  // text

  // project link

  // github link

  // pictures

  public codepenData = [
    {
      type: 'project',
      title: 'Codepen Showcase',
      subtitle: 'HTML, SCSS, JavaScript',
      text:
        'A Showcase of small front end projects publicly hosted on CodePen. These range from website components, ' +
        'such as navigation bars, login pages, pricing pages, and ully functional projects, such as a palette generator, ' +
        'a random shape generator and a css flex demo page.',
      images: [
        {
          src: 'assets/images/logos/prismhr.png',
          alt: 'PrismHR Logo',
        },
        {
          src: 'assets/images/logos/prismhr.png',
          alt: 'PrismHR Logo',
        },
        {
          src: 'assets/images/logos/prismhr.png',
          alt: 'PrismHR Logo',
        },
      ],
      links: [
        {
          title: '',
          link: '',
          icon: '',
        },
      ],
    },
  ];

  public prismhrData = [
    {
      type: 'title',
      title: 'PrismHR',
      image: {
        src: 'assets/images/logos/prismhr.png',
        alt: 'PrismHR Logo',
      },
    },

    {
      type: 'two-column',
      subtitle: 'Position',
      text: 'Mid Level Front End Developer (Angular)',
    },
    {
      type: 'two-column',
      subtitle: 'Tech Stack',
      text: 'Angular, TypeScript, SCSS, HTML',
    },
    {
      type: 'two-column',
      subtitle: 'Toolset',
      text: 'Visual Studio Code, GitHub, StoryBook, Jest, Gulp, PowerShell',
    },

    {
      type: 'two-column',
      subtitle: 'Timeframe',
      text: 'Apr 2024 - Present',
    },
    {
      type: 'two-column',
      subtitle: 'City',
      text: 'Atlanta, GA',
    },
    {
      type: 'list',
      title: 'Key Responsibilities',
      list: [
        'Implemented responsive web interfaces and components using Angular, TypeScript, HTML, and SCSS from Figma prototypes.',
        'Maintained component libraries in Storybook as a resource for the PrismHR onshore and offshore development team.',
        'Developed first party components as a way to replace third party libraries such as Syncfusion.',
        'Completed a large-scale refactoring of components and performed maintenance checks to our component library, and multiple developer environments, ensuring cross-browser compatibility, usability, and performance.',
        'Apply advanced and efficient styling techniques, adhering to BEM conventions for maintainable and scalable code.',
        'Responsible for developing code patterns used to increase efficiency and quality in code development.',
      ],
    },
  ];

  public perficientData = [
    {
      type: 'title',
      title: 'Perficient',

      image: {
        src: 'assets/images/logos/perficient.png',
        alt: 'Perficient Logo',
      },
    },

    {
      type: 'two-column',
      subtitle: 'Position',
      text: 'Front End Developer (Sitecore)',
    },
    {
      type: 'two-column',
      subtitle: 'Tech Stack',
      text: 'Sitecore, React, TypeScript, JavaScript, SCSS, HTML, jQuery, C#, SQL',
    },

    {
      type: 'two-column',
      subtitle: 'Toolset',
      text: 'Visual Studio, Visual Studio Code, Sitecore CMS, Azure DevOps, GitHub, PowerShell',
    },
    {
      type: 'two-column',
      subtitle: 'Timeframe',
      text: 'May 2020 - Dec 2021',
    },
    {
      type: 'two-column',
      subtitle: 'City',
      text: 'Atlanta, GA',
    },
    {
      type: 'list',
      title: 'Key Responsibilities',
      list: [
        'Delivered multiple projects as front end and full stack developer for clients in the healthcare and home renovation industries.',
        'Developed front end features using JavaScript, HTML, SCSS, and Sitecore while focusing on cross-browser accessibility, mobile optimization, and responsive design.',
        'Built full stack features in C#, JavaScript, HTML, and SCSS for an internal site used to train new interns, which included database interactions, user interfaces, and admin dashboards.',
        'Translated Figma prototypes into responsive content pages, components, services, interfaces, and stylesheets.',
        'Implemented the UI and front end logic for the “Find a Location/Store” search feature for multiple projects.',
        'Built full stack features for an internal project for training new hires.',
        'Performed bug fixes and maintenance for front end components. ',
        'Provided active support to developers, content authors, UI designers, project managers, and client teams.',
        'Conducted code reviews for onshores and offshore front end developers.',
        'Regularly participated in client facing demos.',
      ],
    },
  ];
}
