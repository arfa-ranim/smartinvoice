import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { MatDividerModule } from '@angular/material/divider'; 
import { Invoice } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-invoice-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule, MatMenuModule, MatTooltipModule, TranslateModule, CurrencyPipe],
  template: `
    <div class="invoice-table-wrapper">
      <div class="table-header">
        <h2>
          <mat-icon>receipt</mat-icon>
          {{ 'INVOICES.RECENT_INVOICES' | translate }}
        </h2>
        <div class="header-actions">
          <button class="export-btn" (click)="exportData.emit()" matTooltip="Export to Excel">
            <mat-icon>download</mat-icon>
            {{ 'INVOICES.EXPORT' | translate }}
          </button>
          <div class="table-stats">
            <span class="stat-badge">
              <mat-icon>description</mat-icon>
              {{ invoices.length }} {{ 'INVOICES.TOTAL' | translate }}
            </span>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th (click)="sort.emit('id')">
                <div class="th-content">
                  ID
                  <mat-icon class="sort-icon">sort</mat-icon>
                </div>
              </th>
              <th (click)="sort.emit('clientName')">
                <div class="th-content">
                  {{ 'INVOICES.CLIENT' | translate }}
                  <mat-icon class="sort-icon">sort</mat-icon>
                </div>
              </th>
              <th (click)="sort.emit('date')">
                <div class="th-content">
                  {{ 'INVOICES.DATE' | translate }}
                  <mat-icon class="sort-icon">sort</mat-icon>
                </div>
              </th>
              <th (click)="sort.emit('amount')">
                <div class="th-content">
                  {{ 'INVOICES.AMOUNT' | translate }}
                  <mat-icon class="sort-icon">sort</mat-icon>
                </div>
              </th>
              <th>{{ 'INVOICES.STATUS' | translate }}</th>
              <th>{{ 'INVOICES.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of invoices; track invoice.id) {
              <tr 
                [class.overdue-row]="invoice.status === 'overdue'"
                (click)="rowClick.emit(invoice)"
              >
                <td class="invoice-id-cell">
                  <span class="invoice-id">#{{ invoice.id }}</span>
                </td>
                <td>
                  <div class="client-info">
                    <div class="client-avatar" [style.background]="getAvatarColor(invoice.clientInitials)">
                      {{ invoice.clientInitials }}
                    </div>
                    <div class="client-details">
                      <div class="client-name">{{ invoice.client }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-cell">
                    <mat-icon class="date-icon">calendar_today</mat-icon>
                    {{ invoice.dueDate | date:'MMM d, y' }}
                  </div>
                </td>
                <td class="amount-cell">
                  <span class="amount-value">{{ invoice.amount | appCurrency }}</span>
                </td>
                <td>
                  <div class="status-wrapper">
                    <div 
                      class="status-badge" 
                      [class]="invoice.status"
                      (click)="$event.stopPropagation()"
                      [matMenuTriggerFor]="statusMenu"
                      [matTooltip]="'Change status'"
                    >
                      <span class="status-dot"></span>
                      {{ invoice.status }}
                      <mat-icon class="status-arrow">arrow_drop_down</mat-icon>
                    </div>
                    <mat-menu #statusMenu="matMenu">
                      @for (status of statuses; track status) {
                        <button mat-menu-item (click)="statusChange.emit({invoice: invoice, status: status})">
                          <span class="status-option" [class]="status">
                            <span class="status-dot"></span>
                            {{ status }}
                          </span>
                        </button>
                      }
                    </mat-menu>
                  </div>
                </td>
                <td>
                  <div class="action-buttons" (click)="$event.stopPropagation()">
                    <button 
                      class="action-btn" 
                      [matMenuTriggerFor]="actionsMenu"
                      matTooltip="More actions"
                    >
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionsMenu="matMenu">
                      <button mat-menu-item (click)="edit.emit(invoice)">
                        <mat-icon>edit</mat-icon>
                        <span>{{ 'INVOICES.EDIT' | translate }}</span>
                      </button>
                      <button mat-menu-item (click)="markPaid.emit(invoice)">
                        <mat-icon>paid</mat-icon>
                        <span>{{ 'INVOICES.MARK_PAID' | translate }}</span>
                      </button>
                      <button mat-menu-item (click)="reminder.emit(invoice)">
                        <mat-icon>notifications</mat-icon>
                        <span>{{ 'INVOICES.SEND_REMINDER' | translate }}</span>
                      </button>
                      <button mat-menu-item (click)="duplicate.emit(invoice)">
                        <mat-icon>content_copy</mat-icon>
                        <span>{{ 'INVOICES.DUPLICATE' | translate }}</span>
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="viewDetails.emit(invoice)">
                        <mat-icon>visibility</mat-icon>
                        <span>{{ 'INVOICES.VIEW_DETAILS' | translate }}</span>
                      </button>
                    </mat-menu>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr class="empty-row">
                <td colspan="6">
                  <div class="empty-state">
                    <mat-icon class="empty-icon">inbox</mat-icon>
                    <p>{{ 'INVOICES.NO_INVOICES_FOUND' | translate }}</p>
                    <button class="create-invoice-btn" (click)="createInvoice.emit()">
                      <mat-icon>add</mat-icon>
                      {{ 'INVOICES.CREATE_FIRST' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .invoice-table-wrapper {
      background: var(--card-light);
      border: 1px solid var(--border-light);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
    }

    .invoice-table-wrapper:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .table-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 2px solid var(--border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      background: linear-gradient(135deg, rgba(15, 75, 128, 0.02), rgba(0, 0, 0, 0.01));
    }

    .table-header h2 {
      font-size: 1.125rem;
      font-weight: 800;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-light);
    }

    .table-header h2 mat-icon {
      color: var(--primary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .export-btn {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 40px;
      font-weight: 600;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .export-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    body.dark-mode .export-btn {
      background: linear-gradient(135deg, #34d399, #059669);
    }

    .table-stats {
      display: flex;
      gap: 0.5rem;
    }

    .stat-badge {
      background: rgba(15, 75, 128, 0.1);
      padding: 0.375rem 0.875rem;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .stat-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .table-wrapper {
      overflow-x: auto;
      position: relative;
    }

    .modern-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.875rem;
    }

    .modern-table thead tr {
      background: var(--table-header-bg);
    }

    .modern-table th {
      padding: 1rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--table-header-color);
      border-bottom: 2px solid var(--border-light);
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .modern-table th:first-child {
      padding-left: 1.5rem;
    }

    .modern-table th:last-child {
      padding-right: 1.5rem;
    }

    .modern-table th:hover {
      color: var(--primary);
      background: var(--hover-light);
    }

    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    .modern-table th:hover .sort-icon {
      opacity: 1;
    }

    .modern-table tbody tr {
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .modern-table tbody tr:hover {
      background: var(--table-row-hover);
      transform: translateX(4px);
    }

    .modern-table tbody tr.overdue-row {
      background: linear-gradient(90deg, rgba(239, 68, 68, 0.05), transparent);
      border-left: 3px solid #ef4444;
    }

    .modern-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
      transition: all 0.3s ease;
    }

    .modern-table td:first-child {
      padding-left: 1.5rem;
    }

    .modern-table td:last-child {
      padding-right: 1.5rem;
    }

    .modern-table tbody tr:last-child td {
      border-bottom: none;
    }

    .invoice-id-cell {
      width: 100px;
    }

    .invoice-id {
      font-weight: 800;
      font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
      color: var(--primary);
      font-size: 0.875rem;
      letter-spacing: -0.3px;
      background: rgba(15, 75, 128, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      display: inline-block;
    }

    .client-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .client-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0F4C81, #1a6b9e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.875rem;
      color: white;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      flex-shrink: 0;
    }

    .client-info:hover .client-avatar {
      transform: scale(1.1) rotate(5deg);
    }

    .client-details {
      flex: 1;
      min-width: 0;
    }

    .client-name {
      font-weight: 700;
      color: var(--text-light);
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-light);
    }

    .date-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    .amount-cell {
      font-weight: 800;
    }

    .amount-value {
      font-size: 1rem;
      color: var(--text-light);
      background: rgba(0, 0, 0, 0.02);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      display: inline-block;
    }

    .status-wrapper {
      position: relative;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 1rem;
      border-radius: 40px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
    }

    .status-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .status-badge:hover::before {
      left: 100%;
    }

    .status-badge.paid {
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      color: #155724;
    }

    .status-badge.pending {
      background: linear-gradient(135deg, #fff3cd, #ffeaa7);
      color: #856404;
    }

    .status-badge.overdue {
      background: linear-gradient(135deg, #f8d7da, #f5c6cb);
      color: #721c24;
      animation: pulse 2s infinite;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .status-badge.paid .status-dot {
      background: #00b894;
      box-shadow: 0 0 4px #00b894;
    }

    .status-badge.pending .status-dot {
      background: #f39c12;
      box-shadow: 0 0 4px #f39c12;
    }

    .status-badge.overdue .status-dot {
      background: #ef4444;
      box-shadow: 0 0 4px #ef4444;
    }

    .status-arrow {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-left: 0.25rem;
    }

    .status-option {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-option.paid {
      color: #00b894;
    }

    .status-option.pending {
      color: #f39c12;
    }

    .status-option.overdue {
      color: #ef4444;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      white-space: nowrap;
    }

.action-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--primary);
    background: rgba(15, 75, 128, 0.1);
    transform: scale(1.1);
  }

  mat-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
  }
}
body.dark-mode {
  ::ng-deep .mat-mdc-menu-panel {
    background: #1e293b !important;
  }
  
  ::ng-deep .mat-mdc-menu-item:hover {
    background: rgba(255, 193, 7, 0.1) !important;
  }
  
  ::ng-deep .mat-mdc-menu-item .mat-icon {
    color: var(--accent-gold) !important;
  }
}

    .empty-row td {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
    }

    .empty-state p {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }

    .create-invoice-btn {
      background: linear-gradient(135deg, #0F4C81, #1a6b9e);
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
    }

    .create-invoice-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 75, 128, 0.3);
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.85;
      }
    }

    :host-context(body.dark-mode) .invoice-id {
      color: #FFC107;
      background: rgba(255, 193, 7, 0.1);
    }

    :host-context(body.dark-mode) .client-avatar {
      background: linear-gradient(135deg, #FFC107, #FFA000);
      color: #1a1a2e;
    }

    :host-context(body.dark-mode) .status-badge.paid {
      background: linear-gradient(135deg, #1a3a2a, #0d2a1a);
      color: #4ade80;
    }

    :host-context(body.dark-mode) .status-badge.pending {
      background: linear-gradient(135deg, #3a2a1a, #2a1a0d);
      color: #fbbf24;
    }

    :host-context(body.dark-mode) .status-badge.overdue {
      background: linear-gradient(135deg, #3a1a1a, #2a0d0d);
      color: #f87171;
    }

    :host-context(body.dark-mode) .amount-value {
      background: rgba(255, 255, 255, 0.05);
    }

    :host-context(body.dark-mode) .create-invoice-btn {
      background: linear-gradient(135deg, #FFC107, #FFA000);
      color: #1a1a2e;
    }

    :host-context(body.dark-mode) .modern-table th:hover {
      color: #FFC107;
    }

    @media (max-width: 768px) {
      .table-header {
        padding: 1rem;
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: flex-end;
      }

      .modern-table th,
      .modern-table td {
        padding: 0.75rem 1rem;
      }

      .client-avatar {
        width: 32px;
        height: 32px;
        font-size: 0.7rem;
      }

      .client-name {
        white-space: normal;
      }

      .status-badge {
        padding: 0.25rem 0.75rem;
        font-size: 0.65rem;
      }

      .action-btn {
        padding: 0.375rem;
      }
    }

    .table-wrapper::-webkit-scrollbar {
      height: 8px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: var(--border-light);
      border-radius: 10px;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: var(--primary);
      border-radius: 10px;
    }

    :host-context(body.dark-mode) .table-wrapper::-webkit-scrollbar-thumb {
      background: #FFC107;
    }
  `]
})
export class InvoiceTableComponent {
  @Input() invoices: Invoice[] = [];
  @Output() sort = new EventEmitter<'id' | 'clientName' | 'amount' | 'date'>();
  @Output() rowClick = new EventEmitter<Invoice>();
  @Output() statusChange = new EventEmitter<{ invoice: Invoice; status: string }>();
  @Output() edit = new EventEmitter<Invoice>();
  @Output() markPaid = new EventEmitter<Invoice>();
  @Output() reminder = new EventEmitter<Invoice>();
  @Output() duplicate = new EventEmitter<Invoice>();
  @Output() viewDetails = new EventEmitter<Invoice>();
  @Output() createInvoice = new EventEmitter<void>();
  @Output() exportData = new EventEmitter<void>();
  
  statuses = ['paid', 'pending', 'overdue'];

  getAvatarColor(initials: string): string {
    const colors = [
      'linear-gradient(135deg, #0F4C81, #1a6b9e)',
      'linear-gradient(135deg, #00b894, #00cec9)',
      'linear-gradient(135deg, #f39c12, #e67e22)',
      'linear-gradient(135deg, #9b59b6, #8e44ad)',
      'linear-gradient(135deg, #e74c3c, #c0392b)',
      'linear-gradient(135deg, #3498db, #2980b9)'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  }
}