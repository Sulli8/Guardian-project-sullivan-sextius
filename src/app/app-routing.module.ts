import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { CompletePageComponent } from './components/complete-page/complete-page.component';
import { FormPageComponent } from './components/form-page/form-page.component';
import { HomePageComponent } from './components/home-page/home-page.component'; // Import du nouveau composant
import {  ListPrescriptionsComponent } from './components/list-prescriptions/list-prescriptions.component';
import { PrescriptionFormComponent } from './components/prescription-form/prescription-form.component';
import { ErrorComponent } from './pages/error/error.component';
import { ExternalApiComponent } from './pages/external-api/external-api.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ListDrugsComponent } from './components/list-drugs/list-drugs.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';

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
    path: 'home-page',
    component: HomePageComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'profil',
    component: ProfileComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'list-prescriptions',
    component: ListPrescriptionsComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'add-prescription',
    component: PrescriptionFormComponent,
    canActivate: [authGuardFn]
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuardFn]
  },
  {
    path: 'list-drugs',
    component: ListDrugsComponent,
    canActivate: [authGuardFn]
  },
  {
    path: 'questionnaire',
    component: QuestionnaireComponent,
    canActivate: [authGuardFn]
  },
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
];
