import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-invoice-defaults',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslateModule],
  template: `
    <div class="form-card" [formGroup]="parentForm">
      <h3>{{ 'SETTINGS.INVOICE_DEFAULTS' | translate }}</h3>
      <div class="form-grid two-columns">
        <div class="form-field">
          <label>{{ 'SETTINGS.INVOICE_PREFIX' | translate }}</label>
          <input type="text" formControlName="invoicePrefix" placeholder="INV-">
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.NEXT_INVOICE_NUMBER' | translate }}</label>
          <input type="number" formControlName="nextInvoiceNumber" min="1">
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.DEFAULT_DUE_DAYS' | translate }}</label>
          <input type="number" formControlName="defaultDueDays" min="0">
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.DEFAULT_PAYMENT_METHOD' | translate }}</label>
          <select formControlName="defaultPaymentMethod">
            @for (m of paymentMethods; track m){
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.LATE_FEE' | translate }} (%)</label>
          <input type="number" formControlName="lateFeePercent" step="0.5" min="0">
        </div>
      </div>

      <h3 class="section-subtitle">{{ 'SETTINGS.TAX_SETTINGS' | translate }}</h3>
      <div class="form-grid two-columns">
        <div class="form-field">
          <label>{{ 'SETTINGS.DEFAULT_TAX_RATE' | translate }} (%)</label>
          <select formControlName="defaultTaxRate">
            @for (r of taxRates; track r){
              <option [value]="r">{{ r }}%</option>
            }
          </select>
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.INTL_TAX_RULE' | translate }}</label>
          <select formControlName="internationalTaxRule">
            @for (rule of internationalRules; track rule){
              <option [value]="rule">{{ rule }}</option>
            }
          </select>
        </div>
      </div>

      <h3 class="section-subtitle">{{ 'SETTINGS.LEGAL_NOTICE' | translate }}</h3>
      <div class="form-field">
        <textarea formControlName="legalNotice" rows="3" placeholder="{{ 'SETTINGS.LEGAL_NOTICE_PLACEHOLDER' | translate }}"></textarea>
      </div>

      <h3 class="section-subtitle">{{ 'SETTINGS.ADVANCED' | translate }}</h3>
      <div class="form-grid two-columns">
        <div class="checkbox-field">
          <label class="toggle-label">
            <input type="checkbox" formControlName="stripeEnabled">
            {{ 'SETTINGS.ENABLE_STRIPE' | translate }}
          </label>
          @if (parentForm.get('stripeEnabled')?.value) {
            <div class="stripe-key-wrapper">
              <input [type]="showStripeKey ? 'text' : 'password'" formControlName="stripeTestKey" placeholder="pk_test_...">
              <button type="button" class="toggle-visibility-btn" (click)="showStripeKey = !showStripeKey">
                <mat-icon>{{ showStripeKey ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          }
        </div>
        <div class="checkbox-field">
          <label class="toggle-label">
            <input type="checkbox" formControlName="qrCodeEnabled">
            {{ 'SETTINGS.ENABLE_QR' | translate }}
          </label>
        </div>
        <div class="checkbox-field">
          <label class="toggle-label">
            <input type="checkbox" formControlName="emailReminders">
            {{ 'SETTINGS.EMAIL_REMINDERS' | translate }}
          </label>
          @if (parentForm.get('emailReminders')?.value) {
            <div class="reminder-days">
              <label>{{ 'SETTINGS.REMINDER_DAYS' | translate }}</label>
              <input type="number" formControlName="reminderDaysBefore" min="1">
            </div>
          }
        </div>
        <div class="checkbox-field">
          <label class="toggle-label">
            <input type="checkbox" formControlName="bccCopy">
            {{ 'SETTINGS.BCC_COPY' | translate }}
          </label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-card { background: var(--card-light); border: 1px solid var(--border-light); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; }
    h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem; color: var(--text-light); }
    .section-subtitle { font-size: 1rem; font-weight: 700; margin: 1.5rem 0 1rem; color: var(--text-light); }
    .form-grid { display: grid; gap: 1.25rem; }
    .two-columns { grid-template-columns: 1fr; }
    @media (min-width: 768px) { .two-columns { grid-template-columns: repeat(2, 1fr); } }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .checkbox-field { margin: 0.5rem 0; }
    .toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-weight: 600; color: var(--text-light); }
    .stripe-key-wrapper { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .reminder-days { display: flex; align-items: center; gap: 1rem; margin-top: 0.75rem; padding: 0.75rem; background: var(--bg-light); border-radius: 12px; }
    .reminder-days input { width: 80px; }
    .toggle-visibility-btn { background: transparent; border: 1px solid var(--border-light); border-radius: 8px; padding: 0.5rem; cursor: pointer; }
  `]
})
export class InvoiceDefaultsComponent {
  @Input() parentForm!: FormGroup;
  @Input() paymentMethods: string[] = [];
  @Input() taxRates: number[] = [];
  @Input() internationalRules: string[] = [];
  showStripeKey = false;
}