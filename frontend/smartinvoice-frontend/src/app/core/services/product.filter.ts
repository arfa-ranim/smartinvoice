// core/services/product.filter.ts
import { Injectable, computed, inject } from '@angular/core';
import { ProductStateService } from './product.state';

@Injectable({ providedIn: 'root' })
export class ProductFilterService {
  private state = inject(ProductStateService);

  readonly filteredProducts = computed(() => {
    let products = this.state.products();

    const query = this.state.searchQuery().toLowerCase();
    if (query) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    const type = this.state.typeFilter();
    if (type !== 'all') {
      products = products.filter(p => p.type === type);
    }

    const stock = this.state.stockFilter();
    if (stock !== 'all') {
      products = products.filter(p => p.stockStatus === stock);
    }

    const min = this.state.minPrice();
    if (min !== null && min > 0) {
      products = products.filter(p => p.price >= min);
    }
    const max = this.state.maxPrice();
    if (max !== null && max > 0) {
      products = products.filter(p => p.price <= max);
    }

    if (this.state.sortByStockAsc()) {
      products = [...products].sort((a, b) => {
        if (a.stock === -1 && b.stock !== -1) return 1;
        if (b.stock === -1 && a.stock !== -1) return -1;
        return a.stock - b.stock;
      });
    }

    return products;
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.state.itemsPerPage())
  );

  readonly paginatedProducts = computed(() => {
    const start = (this.state.currentPage() - 1) * this.state.itemsPerPage();
    return this.filteredProducts().slice(start, start + this.state.itemsPerPage());
  });
}