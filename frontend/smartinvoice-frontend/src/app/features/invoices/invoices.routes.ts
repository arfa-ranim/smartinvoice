import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./invoice-list/invoice-list').then(m => m.InvoiceList) },
  { path: 'create', loadComponent: () => import('./create-invoice/create-invoice').then(m => m.CreateInvoice) },
  { path: 'edit/:id', loadComponent: () => import('./edit-invoice/edit-invoice').then(m => m.EditInvoice) } 
];