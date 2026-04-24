import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { ProductService, Product, ProductTypeFilter, StockStatusFilter } from '../../../core/services/product.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { EmailService } from '../../../core/services/email.service';
import * as XLSX from 'xlsx';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule,
    MatDialogModule, MatSnackBarModule, Sidebar, BottomNav, TopBar, DragDropModule,
    TranslateModule 
  ],
  templateUrl: './products-list.html',
  styleUrls: ['./products-list.scss']
})
export class ProductsList implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  productService = inject(ProductService);

  Math = Math;
  private searchSubject = new Subject<string>();

  minPriceValue: number | null = null;
  maxPriceValue: number | null = null;
  sortByStock = false;
  itemsPerPageValue = 6;

  columns = [
    { key: 'name', label: this.translate.instant('PRODUCTS.COLUMN_NAME') },
    { key: 'price', label: this.translate.instant('PRODUCTS.COLUMN_PRICE') },
    { key: 'stock', label: this.translate.instant('PRODUCTS.COLUMN_STOCK') },
    { key: 'status', label: this.translate.instant('PRODUCTS.COLUMN_STATUS') },
    { key: 'actions', label: this.translate.instant('PRODUCTS.COLUMN_ACTIONS') }
  ];

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.productService.setSearchQuery(query);
    });

    this.itemsPerPageValue = this.productService.itemsPerPage();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  setTypeFilter(filter: ProductTypeFilter): void {
    this.productService.setTypeFilter(filter);
  }

  setStockFilter(value: string): void {
    this.productService.setStockFilter(value as StockStatusFilter);
  }

  applyPriceFilter(): void {
    this.productService.setMinPrice(this.minPriceValue);
    this.productService.setMaxPrice(this.maxPriceValue);
  }

  clearPriceFilter(): void {
    this.minPriceValue = null;
    this.maxPriceValue = null;
    this.productService.setMinPrice(null);
    this.productService.setMaxPrice(null);
  }

  toggleSortByStock(): void {
    this.sortByStock = !this.sortByStock;
    this.productService.setSortByStockAsc(this.sortByStock);
  }

  onItemsPerPageChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement)?.value || '6', 10);
    this.itemsPerPageValue = value;
    this.productService.setItemsPerPage(value);
  }

  goToPage(page: number): void {
    this.productService.goToPage(page);
  }

  prevPage(): void {
    this.productService.prevPage();
  }

  nextPage(): void {
    this.productService.nextPage();
  }

  getPages(): number[] {
    const total = this.productService.totalPages();
    const current = this.productService.currentPage();
    const pages: number[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        for (let i = current - 2; i <= current + 2; i++) pages.push(i);
      }
    }
    return pages;
  }

  createProduct(): void {
    this.router.navigate(['/products/create']);
  }

  viewInvoices(product: Product): void {
    this.router.navigate(['/invoices'], { queryParams: { productId: product.id } });
  }

  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  adjustStock(product: Product): void {
    const newStock = prompt(this.translate.instant('PRODUCTS.ADJUST_STOCK_PROMPT', { name: product.name, stock: product.stock }), product.stock.toString());
    if (newStock !== null && !isNaN(parseInt(newStock))) {
      const stockValue = parseInt(newStock);
      this.productService.updateStock(product.id, stockValue).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('PRODUCTS.STOCK_UPDATED', { stock: stockValue }), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
        },
        error: () => this.snackBar.open(this.translate.instant('PRODUCTS.STOCK_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 })
      });
    }
  }

  deleteProduct(id: string): void {
    const product = this.productService.filteredProducts().find(p => p.id === id);
    if (confirm(this.translate.instant('PRODUCTS.DELETE_CONFIRM', { name: product?.name }))) {
      this.productService.deleteProduct(id);
      this.snackBar.open(this.translate.instant('PRODUCTS.DELETE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    }
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  onStockChange(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    this.setStockFilter(value);
  }

  incrementStock(product: Product): void {
    const newStock = product.stock + 1;
    if (confirm(this.translate.instant('PRODUCTS.INCREASE_STOCK_CONFIRM', { name: product.name, oldStock: product.stock, newStock: newStock }))) {
      this.productService.updateStock(product.id, newStock).subscribe({
        next: () => this.snackBar.open(this.translate.instant('PRODUCTS.STOCK_INCREASED', { stock: newStock }), this.translate.instant('COMMON.CLOSE'), { duration: 2000 }),
        error: () => this.snackBar.open(this.translate.instant('PRODUCTS.STOCK_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 })
      });
    }
  }

  decrementStock(product: Product): void {
    if (product.stock <= 0) {
      this.snackBar.open(this.translate.instant('PRODUCTS.STOCK_CANNOT_BE_NEGATIVE'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
      return;
    }
    const newStock = product.stock - 1;
    if (confirm(this.translate.instant('PRODUCTS.DECREASE_STOCK_CONFIRM', { name: product.name, oldStock: product.stock, newStock: newStock }))) {
      this.productService.updateStock(product.id, newStock).subscribe({
        next: () => this.snackBar.open(this.translate.instant('PRODUCTS.STOCK_DECREASED', { stock: newStock }), this.translate.instant('COMMON.CLOSE'), { duration: 2000 }),
        error: () => this.snackBar.open(this.translate.instant('PRODUCTS.STOCK_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 })
      });
    }
  }

  exportToExcel(): void {
    const data = this.productService.filteredProducts().map(p => ({
      [this.translate.instant('PRODUCTS.EXPORT_NAME')]: p.name,
      [this.translate.instant('PRODUCTS.EXPORT_SKU')]: p.sku,
      [this.translate.instant('PRODUCTS.EXPORT_TYPE')]: p.type,
      [this.translate.instant('PRODUCTS.EXPORT_PRICE')]: p.price,
      [this.translate.instant('PRODUCTS.EXPORT_TAX')]: p.tax,
      [this.translate.instant('PRODUCTS.EXPORT_STOCK')]: p.type === 'physical' ? p.stock : 'N/A',
      [this.translate.instant('PRODUCTS.EXPORT_STATUS')]: p.stockStatus
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.translate.instant('PRODUCTS.EXPORT_SHEET_NAME'));
    XLSX.writeFile(wb, `products_${new Date().toISOString()}.xlsx`);
    this.snackBar.open(this.translate.instant('PRODUCTS.EXPORT_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  viewProductDetail(product: Product): void {
    this.router.navigate(['/products/detail', product.id]);
  }
}