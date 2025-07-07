import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'portfolio',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'education',
        loadComponent: () =>
          import('./pages/education/education.component').then(
            (c) => c.EducationComponent
          ),
      },
      {
        path: 'experience',
        loadComponent: () =>
          import('./pages/experience/experience.component').then(
            (c) => c.ExperienceComponent
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/projects/projects.component').then(
            (c) => c.ProjectsComponent
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  { path: '**', redirectTo: '/portfolio' },
];
