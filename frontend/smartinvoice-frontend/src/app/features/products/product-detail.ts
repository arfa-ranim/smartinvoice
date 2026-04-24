import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProductService, Product } from '../../core/services/product.service';
import { InvoiceService, Invoice } from '../../core/services/invoice.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatCardModule, CurrencyPipe],
  template: `
    <div class="product-detail-container">
      <button class="back-btn" (click)="goBack()"><mat-icon>arrow_back</mat-icon> Back</button>
      @if (product) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ product.name }}</mat-card-title>
            <mat-card-subtitle>SKU: {{ product.sku }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ product.description }}</p>
            <div class="info-grid">
              <div><strong>Type:</strong> {{ product.type | titlecase }}</div>
              <div><strong>Price:</strong> {{ product.price | appCurrency }}</div>
              <div><strong>Tax:</strong> {{ product.tax }}% ({{ product.taxLabel }})</div>
              @if (product.type === 'physical') {
                <div><strong>Stock:</strong> {{ product.stock }} units</div>
                <div><strong>Status:</strong> {{ product.stockStatus }}</div>
              }
            </div>
            <h3>Associated Invoices</h3>
            @if (invoices.length === 0) {
              <p>No invoices found for this product.</p>
            } @else {
              <table class="invoices-table">
                <thead><tr><th>Invoice ID</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  @for (inv of invoices; track inv.id) {
                    <tr (click)="viewInvoice(inv.id)">
                      <td>{{ inv.id }}</td>
                      <td>{{ inv.client }}</td>
                      <td>{{ inv.amount | appCurrency }}</td>
                      <td><span class="status-badge" [class]="inv.status">{{ inv.status }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </mat-card-content>
          <mat-card-actions>
            <button mat-button (click)="editProduct()">Edit Product</button>
          </mat-card-actions>
        </mat-card>
      } @else {
        <div class="loading">Loading product details...</div>
      }
    </div>
  `,
  styles: [`
    .product-detail-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    .back-btn { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; background: none; border: none; cursor: pointer; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
    .invoices-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .invoices-table th, .invoices-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; }
    .invoices-table tr { cursor: pointer; }
    .invoices-table tr:hover { background: rgba(0,0,0,0.05); }
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
    .status-badge.paid { background: #d4edda; color: #155724; }
    .status-badge.pending { background: #fff3cd; color: #856404; }
    .status-badge.overdue { background: #f8d7da; color: #721c24; }
  `]
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private invoiceService = inject(InvoiceService);
  
  product: Product | null = null;
  invoices: Invoice[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: string): void {
    this.productService.getProducts().subscribe(products => {
      this.product = products.find(p => p.id === id) || null;
      if (this.product) this.loadAssociatedInvoices();
    });
  }

  loadAssociatedInvoices(): void {
    this.invoiceService.getAllInvoices().subscribe(invoices => {
      this.invoices = invoices.filter(inv => 
        inv.lineItems?.some(item => item.productId === this.product?.id)
      );
    });
  }

  editProduct(): void {
    this.router.navigate(['/products/edit', this.product?.id]);
  }

  viewInvoice(id: string): void {
    this.router.navigate(['/invoices', id]);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}