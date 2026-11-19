import { Component } from '@angular/core';
import { LandingComponent } from '../../components/landing/landing.component';
import {
  Project,
  ProjectImage,
  ProjectSectionComponent,
} from '../../components/project-section/project-section.component';

/** Builds the image list for a folder in assets/images named 0.png, 1.png, ... */
function screenshots(
  folder: string,
  count: number,
  title: string,
  ext = 'png'
): ProjectImage[] {
  return Array.from({ length: count }, (_, i) => ({
    src: `assets/images/${folder}/${i}.${ext}`,
    alt: `${title} screenshot ${i + 1}`,
  }));
}

function github(repo: string) {
  return {
    text: 'GitHub',
    link: `https://github.com/6cho/${repo}`,
    icon: 'fa-brands fa-github',
  };
}

interface ProjectGroup {
  title: string;
  subtitle: string;
  projects: Project[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [LandingComponent, ProjectSectionComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  public titleData = {
    title: 'Projects',
    subtitles: ['Personal', 'Client Work', 'Hackathons'],
  };

  public groups: ProjectGroup[] = [
    {
      title: 'Personal Projects',
      subtitle: 'Things I built on my own time',
      projects: [
        {
          title: 'Crypto Price Chart',
          tech: 'React, Node.js, Express.js, TradingView',
          description: [
            'A full stack data visualization app that gathers data on cryptocurrency ' +
              'assets and the market as a whole. Displays live price changes, historical ' +
              'prices, and technical indicators for over 200 cryptocurrencies using ' +
              'interactive charts built with the TradingView library.',
          ],
          images: screenshots('crypto_price_chart', 6, 'Crypto Price Chart'),
          links: [github('Crypto-Price-Chart')],
        },
        {
          title: 'Image Mesh',
          tech: 'React, Node.js, Express.js',
          description: [
            'An image editor that generates edited photos from user-provided images. ' +
              'Users can apply filters and generate pixel art, and each new image comes ' +
              'with a color palette and gradient built from the edited result.',
            'Backed by the Image Mesh API, a separate Node.js server that handles ' +
              'cropping, filtering, pixelation, and palette extraction.',
          ],
          images: screenshots('image_mesh', 8, 'Image Mesh'),
          links: [
            { ...github('image-mesh-react'), text: 'GitHub (Client)' },
            { ...github('image-mesh-server'), text: 'GitHub (API)' },
          ],
        },
        {
          title: 'Pixel Memories',
          tech: 'HTML, SCSS, JavaScript',
          description: [
            'A pixel art photo journal. Photos are organized by year and rendered as ' +
              'pixelated snapshots, each paired with a short caption and location.',
          ],
          images: screenshots('pixel_memories', 5, 'Pixel Memories'),
        },
        {
          title: 'Pixelfy',
          tech: 'Spotify Web API, JavaScript',
          description: [
            'Connects to your Spotify account and displays your top artists as ' +
              'pixel art, along with each artist’s genre and a color palette ' +
              'pulled from their image.',
          ],
          images: screenshots('spotify_pixelfy', 1, 'Pixelfy'),
        },
        {
          title: 'Synthetica',
          tech: 'HTML, SCSS, JavaScript',
          description: [
            'An editorial-style showcase pairing AI-written poetry with bold, ' +
              'magazine-inspired layouts and typography.',
          ],
          images: screenshots('synthetica', 6, 'Synthetica'),
        },
        {
          title: 'Remodel Storefront',
          tech: 'HTML, SCSS, JavaScript',
          description: [
            'A concept e-commerce storefront for a home remodeling brand, with an ' +
              'image carousel, catalog, cart, and favorites views.',
          ],
          images: screenshots('remodel_storefront', 10, 'Remodel Storefront'),
        },
        {
          title: 'Xi Kappa Website',
          tech: 'Weebly CMS, HTML, CSS',
          description: [
            'Website for the Alpha Chapter of Xi Kappa Asian-Interest Fraternity at ' +
              'the University of Georgia, covering the chapter’s history, initiatives, ' +
              'brotherhood, and membership.',
          ],
          images: screenshots('xk_site', 8, 'Xi Kappa Website'),
        },
      ],
    },
    {
      title: 'Client Work',
      subtitle: 'Built at Perficient',
      projects: [
        {
          title: 'Healthcare Provider Search',
          tech: 'Sitecore, React, TypeScript, SCSS',
          description: [
            'Built the front end for a national healthcare system’s “Find a Doctor” ' +
              'and “Find a Location” search. Patients can search by distance, name, ' +
              'and specialty, filter results, and browse them in a list or on an ' +
              'interactive map.',
          ],
          images: [],
        },
        {
          title: 'Retailer Store Locator',
          tech: 'Sitecore, JavaScript, SCSS',
          description: [
            'Implemented the UI and front end logic for a window and door ' +
              'manufacturer’s store locator, letting customers find certified ' +
              'retailers by address or zip code with map results, filters, and ' +
              'directions.',
          ],
          images: [],
        },
        {
          title: 'Medical Equipment Product Pages',
          tech: 'Sitecore, JavaScript, SCSS',
          description: [
            'Translated Figma designs into responsive, CMS-authorable product and ' +
              'service pages for a home medical equipment provider.',
          ],
          images: [],
        },
      ],
    },
    {
      title: 'Hackathons',
      subtitle: 'Built in a weekend',
      projects: [
        {
          title: 'Wand',
          tech: 'Raspberry Pi, Python',
          description: [
            'A hardware hack built on a Raspberry Pi with a webcam and an ultrasonic ' +
              'distance sensor.',
          ],
          images: screenshots('wand', 2, 'Wand', 'jpg'),
        },
      ],
    },
  ];
}
