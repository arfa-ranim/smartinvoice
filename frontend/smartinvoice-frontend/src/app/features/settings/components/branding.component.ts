import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslateModule],
  template: `
    <div class="form-card" [formGroup]="parentForm">
      <h3>{{ 'SETTINGS.BRANDING' | translate }}</h3>
      <div class="form-grid two-columns">
        <div class="form-field">
          <label>{{ 'SETTINGS.COMPANY_LOGO' | translate }}</label>
          <div class="logo-upload">
            @if (logoPreview) {
              <img [src]="logoPreview" alt="Logo preview" class="logo-preview">
            } @else {
              <div class="logo-placeholder">{{ 'SETTINGS.NO_LOGO' | translate }}</div>
            }
            <input #logoInput type="file" accept="image/*" class="hidden-file-input" (change)="onFileSelected($event)">
            <button type="button" class="upload-logo-btn" (click)="logoInput.click()">
              <mat-icon>upload</mat-icon> {{ 'SETTINGS.UPLOAD_LOGO' | translate }}
            </button>
          </div>
        </div>
        <div class="form-field">
          <label>{{ 'SETTINGS.ACCENT_COLOR' | translate }}</label>
          <div class="color-picker-wrapper">
            <input type="color" formControlName="accentColor" class="color-input" (input)="onColorChange($event)">
            <span class="color-value">{{ parentForm.get('accentColor')?.value }}</span>
          </div>
        </div>
      </div>
      <div class="theme-toggle-section">
        <label>{{ 'SETTINGS.THEME' | translate }}</label>
        <div class="theme-toggle-settings">
          <button type="button" class="theme-option" [class.active]="!isDarkMode" (click)="toggleTheme.emit(false)">
            <mat-icon>light_mode</mat-icon> Light
          </button>
          <button type="button" class="theme-option" [class.active]="isDarkMode" (click)="toggleTheme.emit(true)">
            <mat-icon>dark_mode</mat-icon> Dark
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-card { background: var(--card-light); border: 1px solid var(--border-light); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
    h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem; }
    .logo-upload { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .logo-preview { width: 64px; height: 64px; object-fit: contain; border: 1px solid var(--border-light); border-radius: 12px; background: white; padding: 4px; }
    .logo-placeholder { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: var(--bg-light); border: 1px dashed var(--border-light); border-radius: 12px; color: #64748b; font-size: 0.75rem; }
    .upload-logo-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; border: 1px solid var(--border-light); padding: 0.5rem 1rem; border-radius: 10px; cursor: pointer; }
    .hidden-file-input { display: none; }
    .color-picker-wrapper { display: flex; align-items: center; gap: 0.75rem; }
    .color-input { width: 50px; height: 42px; border: 1px solid var(--border-light); border-radius: 10px; cursor: pointer; }
    .theme-toggle-section { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-light); }
    .theme-toggle-settings { display: flex; gap: 0.5rem; background: var(--bg-light); border-radius: 12px; padding: 0.25rem; border: 1px solid var(--border-light); width: fit-content; margin-top: 0.5rem; }
    .theme-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: none; border: none; border-radius: 8px; cursor: pointer; color: #64748b; font-weight: 500; }
    .theme-option.active { background: var(--primary); color: white; }
    body.dark-mode .theme-option.active { background: var(--accent-gold); color: #111; }
  `]
})
export class BrandingComponent {
  @Input() parentForm!: FormGroup;
  @Input() logoPreview = '';
  @Input() isDarkMode = false;
  @Output() logoUpload = new EventEmitter<Event>();
  @Output() accentColorChange = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<boolean>();

  onFileSelected(event: Event): void {
    this.logoUpload.emit(event);
  }
  onColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.parentForm.patchValue({ accentColor: color });
    this.accentColorChange.emit();
  }
}