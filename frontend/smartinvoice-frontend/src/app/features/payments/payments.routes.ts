import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  { path: '', redirectTo: '/invoices', pathMatch: 'full' },
  { path: 'invoice/:id', loadComponent: () => import('./payments/payments').then(m => m.Payments) }
];