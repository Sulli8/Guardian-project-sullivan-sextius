import {
  Routes,
} from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ExternalApiComponent } from './pages/external-api/external-api.component';
import { ErrorComponent } from './pages/error/error.component';
import { authGuardFn } from '@auth0/auth0-angular';
import { FormPageComponent } from './components/form-page/form-page.component';
import { CompletePageComponent } from './components/complete-page/complete-page.component';

export const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'external-api',
    component: ExternalApiComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  {
    path: 'form',
    component: FormPageComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'complete',
    component: CompletePageComponent,
    canActivate: [authGuardFn],
  },
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
];
