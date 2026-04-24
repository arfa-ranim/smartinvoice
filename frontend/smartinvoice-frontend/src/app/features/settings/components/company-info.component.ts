import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-company-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="form-card" [formGroup]="parentForm">
      <h3>{{ 'SETTINGS.COMPANY_INFO' | translate }}</h3>
      <div class="form-grid two-columns">
        <div class="form-field">
          <label>{{ 'SETTINGS.COMPANY_NAME' | translate }} *</label>
          <input type="text" formControlName="companyName" placeholder="{{ 'SETTINGS.COMPANY_NAME_PLACEHOLDER' | translate }}">
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.LEGAL_STATUS' | translate }}</label>
          <input type="text" formControlName="legalStatus" placeholder="{{ 'SETTINGS.LEGAL_STATUS_PLACEHOLDER' | translate }}">
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.TAX_ID' | translate }}</label>
          <input type="text" formControlName="taxId" placeholder="{{ 'SETTINGS.TAX_ID_PLACEHOLDER' | translate }}">
        </div>
        <div class="form-field full-width">
          <label>{{ 'SETTINGS.ADDRESS' | translate }}</label>
          <textarea formControlName="address" rows="3" placeholder="{{ 'SETTINGS.ADDRESS_PLACEHOLDER' | translate }}"></textarea>
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.CONTACT_EMAIL' | translate }}</label>
          <input type="email" formControlName="email" placeholder="{{ 'SETTINGS.CONTACT_EMAIL_PLACEHOLDER' | translate }}">
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.PHONE' | translate }}</label>
          <input type="tel" formControlName="phone" placeholder="{{ 'SETTINGS.PHONE_PLACEHOLDER' | translate }}">
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.WEBSITE' | translate }}</label>
          <input type="url" formControlName="website" placeholder="{{ 'SETTINGS.WEBSITE_PLACEHOLDER' | translate }}">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-card { background: var(--card-light); border: 1px solid var(--border-light); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
    h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem; color: var(--text-light); }
    .form-grid { display: grid; gap: 1.5rem; }
    .two-columns { grid-template-columns: 1fr; }
    @media (min-width: 768px) { .two-columns { grid-template-columns: repeat(2, 1fr); } }
    .full-width { grid-column: 1 / -1; }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field label { font-size: 0.875rem; font-weight: 600; color: #475569; }
    .form-field input, .form-field textarea { width: 100%; padding: 0.75rem 1rem; background: var(--bg-light); border: 1px solid var(--border-light); border-radius: 10px; color: var(--text-light); font-size: 0.875rem; }
    body.dark-mode .form-field input, body.dark-mode .form-field textarea { background: #1e293b; border-color: #334155; color: white; }
  `]
})
export class CompanyInfoComponent {
  @Input() parentForm!: FormGroup;
}