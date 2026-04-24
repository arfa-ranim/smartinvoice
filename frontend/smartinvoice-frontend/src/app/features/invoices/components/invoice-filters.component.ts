import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-invoice-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule
  ],
  template: `
    <div class="filters-container">
      <!-- Main Filter Bar -->
      <div class="filter-bar">
        <div class="filter-row">
          <!-- Search Field -->
          <div class="search-wrapper">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              class="search-input"
              [placeholder]="'INVOICES.SEARCH_PLACEHOLDER' | translate"
              [(ngModel)]="searchQuery"
              (ngModelChange)="searchChange.emit($event)"
              aria-label="Search invoices"
            />
          </div>

          <!-- Status Filters -->
          <div class="filter-chips">
            <button
              class="chip"
              [class.active]="selectedFilter === 'all'"
              (click)="filterChange.emit('all')"
            >
              {{ 'INVOICES.ALL' | translate }}
              <span class="badge">{{ filterCounts.all }}</span>
            </button>
            <button
              class="chip"
              [class.active]="selectedFilter === 'paid'"
              (click)="filterChange.emit('paid')"
            >
              {{ 'INVOICES.PAID' | translate }}
              <span class="badge badge-paid">{{ filterCounts.paid }}</span>
            </button>
            <button
              class="chip"
              [class.active]="selectedFilter === 'pending'"
              (click)="filterChange.emit('pending')"
            >
              {{ 'INVOICES.PENDING' | translate }}
              <span class="badge badge-pending">{{ filterCounts.pending }}</span>
            </button>
            <button
              class="chip"
              [class.active]="selectedFilter === 'overdue'"
              (click)="filterChange.emit('overdue')"
            >
              {{ 'INVOICES.OVERDUE' | translate }}
              <span class="badge badge-overdue">{{ filterCounts.overdue }}</span>
            </button>
          </div>

          <!-- Invoice Type Toggle -->
          <div class="type-toggle">
            <button
              class="type-btn"
              [class.active]="invoiceType === 'all'"
              (click)="invoiceTypeChange.emit('all')"
            >
              All
            </button>
            <button
              class="type-btn"
              [class.active]="invoiceType === 'sales'"
              (click)="invoiceTypeChange.emit('sales')"
            >
              Sales
            </button>
            <button
              class="type-btn"
              [class.active]="invoiceType === 'purchase'"
              (click)="invoiceTypeChange.emit('purchase')"
            >
              Purchases
            </button>
          </div>

          <!-- Toggle Advanced Filters Button -->
          <button class="toggle-advanced-btn" (click)="showAdvanced = !showAdvanced">
            <mat-icon>{{ showAdvanced ? 'expand_less' : 'expand_more' }}</mat-icon>
            {{ showAdvanced ? 'Less Filters' : 'More Filters' }}
          </button>
        </div>
      </div>

      <!-- Advanced Filters Panel -->
      <div class="advanced-panel" [class.show]="showAdvanced">
        <div class="advanced-grid">
          <div class="filter-field">
            <label>{{ 'INVOICES.DATE_FROM' | translate }}</label>
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>{{ 'INVOICES.DATE_FROM' | translate }}</mat-label>
              <input
                matInput
                [matDatepicker]="fromPicker"
                [value]="dateFrom"
                (dateChange)="onDateFromChange($event)"
              />
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="filter-field">
            <label>{{ 'INVOICES.DATE_TO' | translate }}</label>
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>{{ 'INVOICES.DATE_TO' | translate }}</mat-label>
              <input
                matInput
                [matDatepicker]="toPicker"
                [value]="dateTo"
                (dateChange)="onDateToChange($event)"
              />
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>
          </div>
          
          <div class="filter-field">
            <label>{{ 'INVOICES.MIN_AMOUNT' | translate }}</label>
            <input
              type="number"
              class="amount-input"
              [(ngModel)]="minAmount"
              (ngModelChange)="minAmountChange.emit($event ?? 0)"
              placeholder="0"
            />
          </div>

          <div class="filter-field">
            <label>{{ 'INVOICES.MAX_AMOUNT' | translate }}</label>
            <input
              type="number"
              class="amount-input"
              [(ngModel)]="maxAmount"
              (ngModelChange)="maxAmountChange.emit($event ?? 0)"
              placeholder="10000"
            />
          </div>

          <div class="filter-field">
            <label>{{ 'INVOICES.CLIENT' | translate }}</label>
            <select class="client-select" [(ngModel)]="selectedClientId" (ngModelChange)="clientChange.emit($event)">
              <option value="">{{ 'INVOICES.ALL_CLIENTS' | translate }}</option>
              @for (client of clients; track client.id) {
                <option [value]="client.id">{{ client.name }} ({{ client.company }})</option>
              }
            </select>
          </div>

          <button class="clear-btn" (click)="clearFilters.emit()">
            <mat-icon>clear_all</mat-icon>
            {{ 'INVOICES.CLEAR_FILTERS' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Container */
    .filters-container {
      margin-bottom: 1.5rem;
      animation: fadeIn 0.3s ease-out;
    }

    /* Filter Bar */
    .filter-bar {
      background: var(--card-light);
      border-radius: 16px;
      padding: 1rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border-light);
      transition: all 0.3s ease;
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }

    /* Search Wrapper */
    .search-wrapper {
      flex: 1;
      min-width: 200px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 18px;
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border: 2px solid var(--border-light);
      border-radius: 12px;
      background: var(--bg-light);
      color: var(--text-light);
      font-size: 0.875rem;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(15, 75, 128, 0.1);
    }

    /* Filter Chips */
    .filter-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .chip {
      background: transparent;
      border: 1px solid var(--border-light);
      padding: 0.5rem 1rem;
      border-radius: 40px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chip:hover {
      background: rgba(15, 75, 128, 0.05);
      color: var(--primary);
      transform: translateY(-1px);
    }

    .chip.active {
      background: linear-gradient(135deg, #0F4C81 0%, #1a6b9e 100%);
      border-color: transparent;
      color: white;
      box-shadow: 0 2px 8px rgba(15, 75, 128, 0.3);
    }

    .badge {
      background: rgba(0, 0, 0, 0.1);
      padding: 0.125rem 0.5rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .badge-paid {
      background: rgba(0, 184, 148, 0.2);
      color: #00b894;
    }

    .badge-pending {
      background: rgba(255, 193, 7, 0.2);
      color: #f39c12;
    }

    .badge-overdue {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .chip.active .badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    /* Type Toggle */
    .type-toggle {
      display: flex;
      gap: 0.25rem;
      background: rgba(0, 0, 0, 0.03);
      padding: 0.25rem;
      border-radius: 48px;
    }

    .type-btn {
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #64748b;
    }

    .type-btn.active {
      background: var(--card-light);
      color: var(--primary);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .type-btn:hover:not(.active) {
      color: var(--text-light);
    }

    /* Toggle Button */
    .toggle-advanced-btn {
      background: transparent;
      border: 1px solid var(--border-light);
      padding: 0.5rem 1rem;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .toggle-advanced-btn:hover {
      background: var(--hover-light);
      color: var(--primary);
    }

    /* Advanced Panel */
    .advanced-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease-out, margin 0.3s ease;
      margin-top: 0;
    }

    .advanced-panel.show {
      max-height: 500px;
      margin-top: 1rem;
    }

    .advanced-grid {
      background: var(--card-light);
      border-radius: 16px;
      padding: 1.25rem;
      border: 1px solid var(--border-light);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      align-items: flex-end;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-field label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }

    .date-field {
      width: 100%;
    }

    ::ng-deep .date-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .amount-input,
    .client-select {
      padding: 0.625rem 0.875rem;
      border-radius: 10px;
      border: 2px solid var(--border-light);
      background: var(--bg-light);
      color: var(--text-light);
      font-size: 0.875rem;
      transition: all 0.3s ease;
    }

    .amount-input:focus,
    .client-select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(15, 75, 128, 0.1);
    }

    .clear-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 40px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

    .clear-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }

    /* Dark Mode Styles */
    :host-context(body.dark-mode) .chip.active {
      background: linear-gradient(135deg, #FFC107 0%, #FFA000 100%);
      color: #1a1a2e;
    }

    :host-context(body.dark-mode) .type-btn.active {
      background: #1e293b;
      color: #FFC107;
    }

    :host-context(body.dark-mode) .search-input:focus,
    :host-context(body.dark-mode) .amount-input:focus,
    :host-context(body.dark-mode) .client-select:focus {
      border-color: #FFC107;
      box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .filter-bar {
        padding: 1rem;
      }

      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-wrapper {
        width: 100%;
      }

      .filter-chips {
        justify-content: center;
      }

      .type-toggle {
        justify-content: center;
      }

      .toggle-advanced-btn {
        width: 100%;
        justify-content: center;
      }

      .advanced-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InvoiceFiltersComponent {
  @Input() searchQuery = '';
  @Input() selectedFilter: 'all' | 'paid' | 'pending' | 'overdue' = 'all';
  @Input() invoiceType: 'all' | 'sales' | 'purchase' = 'all';
  @Input() dateFrom = '';
  @Input() dateTo = '';
  @Input() minAmount: number | null = null;
  @Input() maxAmount: number | null = null;
  @Input() selectedClientId = '';
  @Input() clients: Client[] = [];
  @Input() filterCounts: { all: number; paid: number; pending: number; overdue: number } = {
    all: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  };

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() invoiceTypeChange = new EventEmitter<string>();
  @Output() dateFromChange = new EventEmitter<string>();
  @Output() dateToChange = new EventEmitter<string>();
  @Output() minAmountChange = new EventEmitter<number>();
  @Output() maxAmountChange = new EventEmitter<number>();
  @Output() clientChange = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

  showAdvanced = false;

  onDateFromChange(event: any): void {
    const date = event.value;
    if (date) {
      this.dateFromChange.emit(date.toISOString().split('T')[0]);
    } else {
      this.dateFromChange.emit('');
    }
  }

  onDateToChange(event: any): void {
    const date = event.value;
    if (date) {
      this.dateToChange.emit(date.toISOString().split('T')[0]);
    } else {
      this.dateToChange.emit('');
    }
  }
}