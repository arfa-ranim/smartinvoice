import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { DraftInvoice } from '../../../core/services/draft.service';

@Component({
  selector: 'app-drafts-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, TranslateModule, CurrencyPipe],
  template: `
    @if (drafts.length) {
      <div class="drafts-container">
        <div class="drafts-header">
          <div class="header-title">
            <mat-icon>drafts</mat-icon>
            <h3>{{ 'INVOICES.DRAFT_INVOICES' | translate }}</h3>
            <span class="draft-count">{{ drafts.length }}</span>
          </div>
          <button class="clear-all-btn" (click)="clearAll.emit()" matTooltip="Clear all drafts">
            <mat-icon>delete_sweep</mat-icon>
            {{ 'INVOICES.CLEAR_ALL' | translate }}
          </button>
        </div>
        
        <div class="drafts-grid">
          @for (draft of drafts; track draft.id) {
            <div class="draft-item">
              <div class="draft-status">
                <span class="status-badge draft">
                  <span class="status-dot"></span>
                  Draft
                </span>
                <span class="draft-date">{{ draft.createdAt | date:'MMM d, y, h:mm a' }}</span>
              </div>
              
              <div class="draft-info">
                <div class="draft-id">
                  <mat-icon>receipt</mat-icon>
                  <span>{{ draft.id }}</span>
                </div>
                <div class="draft-client">
                  <mat-icon>person</mat-icon>
                  <span>{{ draft.clientName }}</span>
                </div>
                <div class="draft-amount">
                  <mat-icon>payments</mat-icon>
                  <span>{{ draft.amount | appCurrency }}</span>
                </div>
              </div>
              
              <div class="draft-actions">
                <button class="resume-btn" (click)="resume.emit(draft)">
                  <mat-icon>edit</mat-icon>
                  {{ 'INVOICES.RESUME' | translate }}
                </button>
                <button class="delete-btn" (click)="delete.emit(draft.id)">
                  <mat-icon>delete</mat-icon>
                  {{ 'INVOICES.DELETE' | translate }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .drafts-container {
      background: var(--card-light);
      border-radius: 20px;
      margin-bottom: 2rem;
      padding: 1.25rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
    }

    .drafts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border-light);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-title mat-icon {
      color: #f39c12;
      font-size: 24px;
    }

    .header-title h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-light);
    }

    .draft-count {
      background: linear-gradient(135deg, #f39c12, #e67e22);
      color: white;
      padding: 0.125rem 0.5rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .clear-all-btn {
      background: transparent;
      border: 1px solid var(--border-light);
      padding: 0.5rem 1rem;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .clear-all-btn:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
      transform: translateY(-2px);
    }

    .drafts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .draft-item {
      background: var(--bg-light);
      border-radius: 16px;
      padding: 1rem;
      transition: all 0.3s ease;
      border: 1px solid var(--border-light);
      position: relative;
      overflow: hidden;
    }

    .draft-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #f39c12, #e67e22);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .draft-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .draft-item:hover::before {
      transform: scaleX(1);
    }

    .draft-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .status-badge.draft {
      background: linear-gradient(135deg, #fff3cd, #ffeaa7);
      color: #856404;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f39c12;
      display: inline-block;
      animation: pulse 2s infinite;
    }

    .draft-date {
      font-size: 0.7rem;
      color: var(--text-secondary-light);
    }

    .draft-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .draft-id, .draft-client, .draft-amount {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .draft-id mat-icon, .draft-client mat-icon, .draft-amount mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
    }

    .draft-id span {
      font-family: 'SF Mono', monospace;
      font-weight: 700;
      color: var(--primary);
    }

    .draft-client span {
      font-weight: 600;
      color: var(--text-light);
    }

    .draft-amount span {
      font-weight: 800;
      color: var(--primary);
      font-size: 1.125rem;
    }

    .draft-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .resume-btn, .delete-btn {
      flex: 1;
      padding: 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: none;
    }

    .resume-btn {
      background: linear-gradient(135deg, #0F4C81, #1a6b9e);
      color: white;
    }

    .resume-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 75, 128, 0.3);
    }

    .delete-btn {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .delete-btn:hover {
      background: #ef4444;
      color: white;
      transform: translateY(-2px);
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Dark Mode */
    :host-context(body.dark-mode) .draft-item {
      background: var(--card-dark);
    }

    :host-context(body.dark-mode) .resume-btn {
      background: linear-gradient(135deg, #FFC107, #FFA000);
      color: #1a1a2e;
    }

    :host-context(body.dark-mode) .draft-id span {
      color: #FFC107;
    }

    :host-context(body.dark-mode) .draft-amount span {
      color: #FFC107;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .drafts-container {
        padding: 1rem;
      }

      .drafts-grid {
        grid-template-columns: 1fr;
      }

      .draft-actions {
        flex-direction: column;
      }

      .header-title h3 {
        font-size: 1rem;
      }
    }
  `]
})
export class DraftsPanelComponent {
  @Input() drafts: DraftInvoice[] = [];
  @Output() resume = new EventEmitter<DraftInvoice>();
  @Output() delete = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();
}