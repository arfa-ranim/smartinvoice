// core/services/product.state.ts
import { Injectable, signal } from '@angular/core';
import { Product } from '../types/product.types';

@Injectable({ providedIn: 'root' })
export class ProductStateService {
  private productsSignal = signal<Product[]>([]);
  readonly products = this.productsSignal.asReadonly();

  readonly searchQuery = signal('');
  readonly typeFilter = signal<'all' | 'physical' | 'service'>('all');
  readonly stockFilter = signal<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly sortByStockAsc = signal(false);
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(6);

  setProducts(products: Product[]): void {
    this.productsSignal.set(products);
  }

  updateProduct(updated: Product): void {
    const index = this.productsSignal().findIndex(p => p.id === updated.id);
    if (index !== -1) {
      const newProducts = [...this.productsSignal()];
      newProducts[index] = updated;
      this.productsSignal.set(newProducts);
    }
  }

  addProduct(product: Product): void {
    this.productsSignal.update(products => [...products, product]);
  }

  deleteProduct(id: string): void {
    this.productsSignal.update(products => products.filter(p => p.id !== id));
  }

  resetPagination(): void {
    this.currentPage.set(1);
  }
}