// app.routes.ts
import { Routes , Router } from '@angular/router';
import { inject } from '@angular/core';
import { Landing } from './core/landing/landing';
import { AuthService } from './core/auth/auth.service';

// Functional Auth Guard
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    return true;
  }
  return router.parseUrl('/auth/sign-in');
};

export const routes: Routes = [
  { path: '', component: Landing, data: { layout: 'public' } },
  {
    path: 'auth',
    loadChildren: () => import('./core/auth/auth.routes').then(m => m.AUTH_ROUTES),
    data: { layout: 'public' }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile/profile').then(m => m.Profile),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings/settings').then(m => m.Settings),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  },
  {
    path: 'invoices',
    loadChildren: () => import('./features/invoices/invoices.routes').then(m => m.INVOICES_ROUTES),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  },
  {
    path: 'payments',
    loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENTS_ROUTES),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  },
  {
    path: 'clients',
    loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics/analytics').then(m => m.Analytics),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
    canActivate: [authGuard],
    data: { layout: 'authenticated' }
  }
];