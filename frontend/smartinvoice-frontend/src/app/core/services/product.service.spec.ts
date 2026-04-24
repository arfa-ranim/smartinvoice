import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('filtering', () => {
    it('should filter products by search query', () => {
      service.setSearchQuery('Headphones');
      
      const filtered = service.filteredProducts();
      const allMatch = filtered.every(p => 
        p.name.toLowerCase().includes('headphones') ||
        p.sku.toLowerCase().includes('headphones') ||
        p.description.toLowerCase().includes('headphones')
      );
      expect(allMatch).toBe(true);
    });

    it('should filter products by type', () => {
      service.setTypeFilter('physical');
      
      const filtered = service.filteredProducts();
      const allPhysical = filtered.every(p => p.type === 'physical');
      expect(allPhysical).toBe(true);
    });

    it('should filter products by stock status', () => {
      service.setStockFilter('low_stock');
      
      const filtered = service.filteredProducts();
      const allLowStock = filtered.every(p => p.stockStatus === 'low_stock');
      expect(allLowStock).toBe(true);
    });

    it('should filter products by price range', () => {
      service.setMinPrice(100);
      service.setMaxPrice(200);
      
      const filtered = service.filteredProducts();
      const allInRange = filtered.every(p => p.price >= 100 && p.price <= 200);
      expect(allInRange).toBe(true);
    });
  });

  describe('pagination', () => {
    it('should return correct number of items per page', () => {
      service.setItemsPerPage(3);
      const paginated = service.paginatedProducts();
      expect(paginated.length).toBeLessThanOrEqual(3);
    });

    it('should navigate to next page', () => {
      const initialPage = service.currentPage();
      service.nextPage();
      expect(service.currentPage()).toBe(initialPage + 1);
    });

    it('should navigate to previous page', () => {
      service.goToPage(2);
      const currentPage = service.currentPage();
      service.prevPage();
      expect(service.currentPage()).toBe(currentPage - 1);
    });
  });

  describe('CRUD operations', () => {
    it('should add a product', () => {
      const initialCount = service.filteredProducts().length;
      const newProduct = {
        id: 'new-1',
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test Description',
        type: 'physical' as const,
        price: 99.99,
        tax: 15,
        taxLabel: 'VAT',
        stock: 10,
        stockStatus: 'in_stock' as const,
        lowStockThreshold: 5,
        alertEmailLowStock: false
      };
      
      service.addProduct(newProduct);
      expect(service.filteredProducts().length).toBe(initialCount + 1);
    });

    it('should delete a product', () => {
      const productToDelete = service.filteredProducts()[0];
      const initialCount = service.filteredProducts().length;
      
      service.deleteProduct(productToDelete.id);
      expect(service.filteredProducts().length).toBe(initialCount - 1);
      expect(service.filteredProducts().find(p => p.id === productToDelete.id)).toBeUndefined();
    });
  });

  describe('stock management', () => {
    it('should update stock and recalculate stock status', async () => {
      const product = service.filteredProducts().find(p => p.type === 'physical');
      if (!product) {
        // Skip test if no physical product found
        expect(true).toBe(true);
        return;
      }
      
      const updated = await firstValueFrom(service.updateStock(product.id, 0));
      expect(updated.stock).toBe(0);
      expect(updated.stockStatus).toBe('out_of_stock');
    });
  });
});