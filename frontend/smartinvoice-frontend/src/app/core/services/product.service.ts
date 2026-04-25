// core/services/product.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EmailService } from './email.service';

// ============================================================================
// TYPES
// ============================================================================
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  type: 'physical' | 'service';
  price: number;
  tax: number;
  taxLabel: string;
  stock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl?: string;
  isService?: boolean;
  lowStockThreshold?: number;
  alertEmailLowStock?: boolean;
}

export type ProductTypeFilter = 'all' | 'physical' | 'service';
export type StockStatusFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  alertEmailLowStock?: boolean;
}

// ============================================================================
// MOCK DATA (only used for initial load if no data exists)
// ============================================================================
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Over-Ear Headphones',
    sku: 'AUD-WH-900',
    description: 'Professional-grade noise cancellation with up to 40 hours of battery life.',
    type: 'physical',
    price: 299.00,
    tax: 15,
    taxLabel: 'VAT',
    stock: 42,
    stockStatus: 'in_stock',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    lowStockThreshold: 10,
    alertEmailLowStock: true
  },
  {
    id: '2',
    name: 'UI/UX Consulting',
    sku: 'SRV-CNSLT-01',
    description: 'Professional audit and design strategy for digital products.',
    type: 'service',
    price: 120.00,
    tax: 0,
    taxLabel: 'Exempt',
    stock: -1,
    stockStatus: 'in_stock',
    isService: true,
    lowStockThreshold: 5,
    alertEmailLowStock: false
  },
  {
    id: '3',
    name: 'Mechanical Keyframe Pro',
    sku: 'KBD-MEC-V2',
    description: 'Compact 75% layout with hot-swappable switches.',
    type: 'physical',
    price: 185.00,
    tax: 10,
    taxLabel: 'GST',
    stock: 4,
    stockStatus: 'low_stock',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33d50bdf?w=400&h=300&fit=crop',
    lowStockThreshold: 5,
    alertEmailLowStock: true
  },
  {
    id: '4',
    name: 'Backend Security Audit',
    sku: 'SRV-SEC-01',
    description: 'Comprehensive security penetration testing.',
    type: 'service',
    price: 2500.00,
    tax: 21,
    taxLabel: 'VAT',
    stock: -1,
    stockStatus: 'in_stock',
    isService: true,
    lowStockThreshold: 1,
    alertEmailLowStock: false
  },
  {
    id: '5',
    name: 'Architect Table Lamp',
    sku: 'LMP-ARC-44',
    description: 'Adjustable steel frame with warm-light LED.',
    type: 'physical',
    price: 75.00,
    tax: 15,
    taxLabel: 'VAT',
    stock: 0,
    stockStatus: 'out_of_stock',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6e0579b41d8?w=400&h=300&fit=crop',
    lowStockThreshold: 3,
    alertEmailLowStock: true
  }
];

// ============================================================================
// SERVICE
// ============================================================================
@Injectable({ providedIn: 'root' })
export class ProductService {
  private emailService = inject(EmailService);
  private readonly STORAGE_KEY = 'smartinvoice_products';

  // --------------------------------------------------------------------------
  // Data Signal with localStorage persistence
  // --------------------------------------------------------------------------
  private productsSignal = signal<Product[]>([]);

  // --------------------------------------------------------------------------
  // Filter & Pagination Signals
  // --------------------------------------------------------------------------
  searchQuery = signal('');
  typeFilter = signal<ProductTypeFilter>('all');
  stockFilter = signal<StockStatusFilter>('all');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortByStockAsc = signal(false);
  currentPage = signal(1);
  itemsPerPage = signal(6);
  pageSizeOptions = [6, 12, 24, 48];

  constructor() {
    this.loadFromStorage();
  }

  // --------------------------------------------------------------------------
  // Storage Methods
  // --------------------------------------------------------------------------
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const products = JSON.parse(stored);
        this.productsSignal.set(products);
      } else {
        // Initialize with mock data
        this.productsSignal.set([...MOCK_PRODUCTS]);
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to load products from storage:', error);
      this.productsSignal.set([...MOCK_PRODUCTS]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.productsSignal()));
    } catch (error) {
      console.error('Failed to save products to storage:', error);
    }
  }

  // --------------------------------------------------------------------------
  // Computed: Filtered Products
  // --------------------------------------------------------------------------
  filteredProducts = computed(() => {
    let products = this.productsSignal();

    // Search by name, SKU, or description
    const query = this.searchQuery().toLowerCase();
    if (query) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Filter by type
    const type = this.typeFilter();
    if (type !== 'all') {
      products = products.filter(p => p.type === type);
    }

    // Filter by stock status
    const stock = this.stockFilter();
    if (stock !== 'all') {
      products = products.filter(p => p.stockStatus === stock);
    }

    // Price range filter
    const min = this.minPrice();
    if (min !== null && min > 0) {
      products = products.filter(p => p.price >= min);
    }
    const max = this.maxPrice();
    if (max !== null && max > 0) {
      products = products.filter(p => p.price <= max);
    }

    // Sort by stock (lowest first) – services (stock -1) go to the end
    if (this.sortByStockAsc()) {
      products = [...products].sort((a, b) => {
        if (a.stock === -1 && b.stock !== -1) return 1;
        if (b.stock === -1 && a.stock !== -1) return -1;
        return a.stock - b.stock;
      });
    }

    return products;
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.itemsPerPage())
  );

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredProducts().slice(start, start + this.itemsPerPage());
  });

  // --------------------------------------------------------------------------
  // Filter Actions
  // --------------------------------------------------------------------------
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setTypeFilter(filter: ProductTypeFilter): void {
    this.typeFilter.set(filter);
    this.currentPage.set(1);
  }

  setStockFilter(filter: StockStatusFilter): void {
    this.stockFilter.set(filter);
    this.currentPage.set(1);
  }

  setMinPrice(price: number | null): void {
    this.minPrice.set(price);
    this.currentPage.set(1);
  }

  setMaxPrice(price: number | null): void {
    this.maxPrice.set(price);
    this.currentPage.set(1);
  }

  setSortByStockAsc(enabled: boolean): void {
    this.sortByStockAsc.set(enabled);
    this.currentPage.set(1);
  }

  setItemsPerPage(size: number): void {
    this.itemsPerPage.set(size);
    this.currentPage.set(1);
  }

  // --------------------------------------------------------------------------
  // Pagination Actions
  // --------------------------------------------------------------------------
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  // --------------------------------------------------------------------------
  // CRUD Operations with persistence
  // --------------------------------------------------------------------------
  getProducts(): Observable<Product[]> {
    return of(this.productsSignal()).pipe(delay(200));
  }

  addProduct(product: Product): void {
    this.productsSignal.update(products => [...products, product]);
    this.saveToStorage();
  }

  updateProduct(product: Product): void {
    const index = this.productsSignal().findIndex(p => p.id === product.id);
    if (index !== -1) {
      const updated = [...this.productsSignal()];
      updated[index] = product;
      this.productsSignal.set(updated);
      this.saveToStorage();
    }
  }

  deleteProduct(id: string): void {
    this.productsSignal.update(products => products.filter(p => p.id !== id));
    this.saveToStorage();
    
    if (this.currentPage() > this.totalPages() && this.totalPages() > 0) {
      this.currentPage.set(this.totalPages());
    }
  }

  updateStock(productId: string, newStock: number): Observable<Product> {
    const index = this.productsSignal().findIndex(p => p.id === productId);
    if (index === -1) throw new Error('Product not found');

    const product = this.productsSignal()[index];
    const updatedStock = Math.max(0, newStock);
    let stockStatus: Product['stockStatus'] = 'in_stock';
    if (updatedStock <= 0) stockStatus = 'out_of_stock';
    else if (updatedStock <= (product.lowStockThreshold || 5)) stockStatus = 'low_stock';
    else stockStatus = 'in_stock';

    const updatedProduct = { ...product, stock: updatedStock, stockStatus };
    this.updateProduct(updatedProduct);

    // Send low stock alert if configured and status just became low
    if (product.alertEmailLowStock && stockStatus === 'low_stock' && product.stockStatus !== 'low_stock') {
      this.emailService.sendLowStockAlert(product.name, updatedStock, product.lowStockThreshold || 5).subscribe();
    }
    return of(updatedProduct).pipe(delay(200));
  }

  checkSkuExists(sku: string, excludeId?: string): boolean {
    return this.productsSignal().some(p => p.sku === sku && p.id !== excludeId);
  }

  // --------------------------------------------------------------------------
  // Reset to mock data
  // --------------------------------------------------------------------------
  resetToMockData(): void {
    this.productsSignal.set([...MOCK_PRODUCTS]);
    this.saveToStorage();
    this.currentPage.set(1);
    this.searchQuery.set('');
    this.typeFilter.set('all');
    this.stockFilter.set('all');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortByStockAsc.set(false);
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  getStockStatusText(status: string): string {
    const map: Record<string, string> = {
      in_stock: 'In stock',
      low_stock: 'Low stock',
      out_of_stock: 'Out of stock'
    };
    return map[status] || status;
  }

  getStockStatusClass(status: string): string {
    const map: Record<string, string> = {
      in_stock: 'in-stock',
      low_stock: 'low-stock',
      out_of_stock: 'out-of-stock'
    };
    return map[status] || '';
  }

  getTopProducts(limit: number): Observable<TopProduct[]> {
    const mockTop: TopProduct[] = [
      { name: 'Pro Plan Subscription', quantity: 342, revenue: 68400 },
      { name: 'Enterprise License', quantity: 28, revenue: 56000 },
      { name: 'Consulting Hour', quantity: 156, revenue: 46800 },
      { name: 'Support Package', quantity: 98, revenue: 19600 },
      { name: 'Setup Fee', quantity: 45, revenue: 13500 }
    ];
    return of(mockTop.slice(0, limit));
  }
}