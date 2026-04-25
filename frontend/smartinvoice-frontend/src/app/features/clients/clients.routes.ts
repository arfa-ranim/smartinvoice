import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./clients/clients').then(m => m.Clients) },
  { path: 'create', loadComponent: () => import('./create-client/create-client').then(m => m.CreateClient) },
  { path: 'edit/:id', loadComponent: () => import('./edit-client/edit-client').then(m => m.EditClient) } 
];