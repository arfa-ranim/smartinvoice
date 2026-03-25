import { Routes } from '@angular/router';
import { Landing } from './core/landing/landing';

export const routes: Routes = [
  {
    path: '',
    component: Landing
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./core/auth/auth.routes').then(m => m.AUTH_ROUTES)
  }
];