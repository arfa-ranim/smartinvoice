import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface MoreFiltersData {
  country?: string;
  clientType?: 'all' | 'company' | 'individual';
}

@Component({
  selector: 'app-more-filters-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'CLIENTS.MORE_FILTERS' | translate }}</h2>
    <mat-dialog-content>
      <div class="filter-group">
        <label>{{ 'CLIENTS.COUNTRY' | translate }}</label>
        <select [(ngModel)]="filters.country" class="filter-select">
          <option value="">{{ 'CLIENTS.ALL_COUNTRIES' | translate }}</option>
          <option *ngFor="let country of countries" [value]="country">{{ country }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>{{ 'CLIENTS.CLIENT_TYPE' | translate }}</label>
        <div class="radio-group">
          <label><input type="radio" [(ngModel)]="filters.clientType" value="all"> {{ 'CLIENTS.ALL' | translate }}</label>
          <label><input type="radio" [(ngModel)]="filters.clientType" value="company"> {{ 'CLIENTS.COMPANY' | translate }}</label>
          <label><input type="radio" [(ngModel)]="filters.clientType" value="individual"> {{ 'CLIENTS.INDIVIDUAL' | translate }}</label>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="clear()">{{ 'COMMON.CLEAR' | translate }}</button>
      <button mat-button (click)="apply()" color="primary">{{ 'COMMON.APPLY' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .filter-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .filter-select { padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-light); }
    .radio-group { display: flex; gap: 1rem; }
    label { display: flex; align-items: center; gap: 0.25rem; }
  `]
})
export class MoreFiltersDialog {
  dialogRef = inject(MatDialogRef<MoreFiltersDialog>);
  data = inject<MoreFiltersData>(MAT_DIALOG_DATA);
  filters: MoreFiltersData = { ...this.data };
  countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France'];
  clear() { this.filters = { clientType: 'all', country: '' }; }
  apply() { this.dialogRef.close(this.filters); }
}