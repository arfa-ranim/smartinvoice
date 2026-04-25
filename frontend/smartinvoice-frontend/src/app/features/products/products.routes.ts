import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./products-list/products-list').then(m => m.ProductsList) },
  { path: 'create', loadComponent: () => import('./create-product/create-product').then(m => m.CreateProduct) },
  { path: 'edit/:id', loadComponent: () => import('./edit-product/edit-product').then(m => m.EditProduct) },
  { path: 'detail/:id', loadComponent: () => import('./product-detail').then(m => m.ProductDetail) } 
];