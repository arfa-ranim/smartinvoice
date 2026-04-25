import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-invoice-summary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TranslateModule],
  template: `
    <div class="totals-card">
      <div class="total-row">
        <span>{{ 'INVOICES.SUBTOTAL' | translate }}</span>
        <span>{{ subtotal | appCurrency }}</span>
      </div>
      <div class="total-row">
        <span>{{ 'INVOICES.VAT' | translate }} (19%)</span>
        <span>{{ vat | appCurrency }}</span>
      </div>
      <div class="divider"></div>
      <div class="total-row grand-total">
        <span>{{ 'INVOICES.GRAND_TOTAL' | translate }}</span>
        <span>{{ grandTotal | appCurrency }}</span>
      </div>
    </div>
  `,
  styles: [`
    .totals-card { background: var(--card-light); border: 1px solid var(--border-light); border-radius: 12px; padding: 1.5rem; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #64748b; }
    .grand-total { margin-top: 0.5rem; font-size: 1.125rem; font-weight: 700; }
    .grand-total span:last-child { color: var(--primary); font-size: 1.25rem; }
    .divider { height: 1px; background: var(--border-light); margin: 1rem 0; }
  `]
})
export class InvoiceSummaryComponent {
  @Input() subtotal = 0;
  @Input() vat = 0;
  @Input() grandTotal = 0;
}