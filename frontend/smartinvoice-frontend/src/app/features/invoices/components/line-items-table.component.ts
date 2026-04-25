import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Product } from '../../../core/types/product.types';

@Component({
  selector: 'app-line-items-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslateModule, CurrencyPipe],
  template: `
    <div class="table-responsive">
      <table class="line-items-table">
        <thead>
          <tr>
            <th>{{ 'INVOICES.DESCRIPTION' | translate }}</th>
            <th class="qty-col">{{ 'INVOICES.QTY' | translate }}</th>
            <th class="price-col">{{ 'INVOICES.PRICE' | translate }}</th>
            <th class="total-col">{{ 'INVOICES.TOTAL' | translate }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (control of lineItemsArray.controls; track control; let i = $index) {
            <tr [formGroup]="getLineFormGroup(control)">
              <td class="description-cell">
                <input type="text" formControlName="description" class="form-input" [placeholder]="'INVOICES.PRODUCT_SERVICE_NAME' | translate" (input)="onDescriptionInput(i, $event)" />
                @if (productSuggestions[i]?.length) {
                  <div class="product-suggestions">
                    @for (prod of productSuggestions[i]; track prod.id) {
                      <div class="suggestion-item" (click)="selectProduct(i, prod)">{{ prod.name }}</div>
                    }
                  </div>
                }
              </td>
              <td><input type="number" formControlName="quantity" class="form-input" min="1" /></td>
              <td><input type="number" formControlName="price" class="form-input" min="0" step="0.01" /></td>
              <td>{{ (control.get('quantity')?.value || 0) * (control.get('price')?.value || 0) | appCurrency }}</td>
              <td><button type="button" class="icon-btn" (click)="removeLineItem.emit(i)"><mat-icon>delete</mat-icon></button></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="add-line">
      <button type="button" (click)="addLineItem.emit()"><mat-icon>add_circle</mat-icon> {{ 'INVOICES.ADD_LINE' | translate }}</button>
    </div>
  `,
  styles: [`
    .table-responsive { overflow-x: auto; }
    .line-items-table { width: 100%; border-collapse: collapse; min-width: 500px; }
    .line-items-table th, .line-items-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-light); }
    .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border-light); border-radius: 6px; background: var(--bg-light); }
    .icon-btn { background: transparent; border: none; cursor: pointer; color: #94a3b8; }
    .add-line { padding: 1rem 1.5rem; border-top: 1px solid var(--border-light); }
    .add-line button { background: transparent; border: none; color: #10b981; display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .product-suggestions { position: absolute; background: var(--card-light); border: 1px solid var(--border-light); border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 1000; width: calc(100% - 2rem); margin-top: 4px; }
    .suggestion-item { padding: 0.5rem 1rem; cursor: pointer; }
    .description-cell { position: relative; }
  `]
})
export class LineItemsTableComponent {
  @Input() lineItemsArray!: FormArray;
  @Input() productSuggestions: Product[][] = [];
  @Input() products: Product[] = [];
  @Output() addLineItem = new EventEmitter<void>();
  @Output() removeLineItem = new EventEmitter<number>();
  @Output() updateSuggestions = new EventEmitter<{ index: number; search: string }>();
  @Output() productSelected = new EventEmitter<{ index: number; product: Product }>();

  getLineFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  onDescriptionInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateSuggestions.emit({ index, search: value });
  }

  selectProduct(index: number, product: Product): void {
    this.productSelected.emit({ index, product });
  }
}