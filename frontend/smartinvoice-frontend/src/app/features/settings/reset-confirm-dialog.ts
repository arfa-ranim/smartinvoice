import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

export interface ResetDialogData {
  items: string[];
}

@Component({
  selector: 'app-reset-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'SETTINGS.RESET_DEMO_DATA' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'SETTINGS.RESET_CONFIRM_MSG' | translate }}</p>
      <ul>
        @for (item of data.items; track item) {
          <li>{{ item }}</li>
        }
      </ul>
      <p class="warning">{{ 'SETTINGS.RESET_WARNING' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-raised-button color="warn" (click)="confirm()">{{ 'SETTINGS.RESET_ALL_DATA' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .warning { color: #ef4444; font-weight: bold; margin-top: 1rem; }
  `]
})
export class ResetConfirmDialog {
  private dialogRef = inject(MatDialogRef<ResetConfirmDialog>);
  data = inject<ResetDialogData>(MAT_DIALOG_DATA);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}