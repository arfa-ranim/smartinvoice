import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-account-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, FormsModule, TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ 'PROFILE.DELETE_ACCOUNT' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'PROFILE.DELETE_CONFIRM_MSG' | translate }}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'PROFILE.PASSWORD' | translate }}</mat-label>
        <input matInput type="password" [(ngModel)]="password" [placeholder]="'PROFILE.ENTER_PASSWORD' | translate" required>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-raised-button color="warn" [disabled]="!password" (click)="confirm()">{{ 'PROFILE.DELETE_FOREVER' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-top: 1rem;
    }
  `]
})
export class DeleteAccountDialog {
  password = '';
  private dialogRef = inject(MatDialogRef<DeleteAccountDialog>);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    // Simulate deletion – in a real app you'd send the password to backend
    this.dialogRef.close(true);
  }
}