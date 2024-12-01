import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { EducationComponent } from './pages/education/education.component';
import { ExperienceComponent } from './pages/experience/experience.component';

export const routes: Routes = [
  {
    path: 'portfolio',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'education', component: EducationComponent },
      { path: 'experience', component: ExperienceComponent },
      { path: 'projects', component: ProjectsComponent },
    ],
  },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '/portfolio' },
];
