import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

export interface DeleteConfirmData {
  clientName: string;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'CLIENTS.DELETE_TITLE' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'CLIENTS.DELETE_CONFIRM_MSG' | translate }} <strong>{{ data.clientName }}</strong>?</p>
      <p>{{ 'CLIENTS.TYPE_NAME_TO_CONFIRM' | translate }}</p>
      <mat-form-field appearance="outline" style="width: 100%;">
        <input matInput [(ngModel)]="confirmName" [placeholder]="'CLIENTS.CLIENT_NAME_PLACEHOLDER' | translate">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-button color="warn" [disabled]="confirmName !== data.clientName" (click)="confirm()">{{ 'COMMON.DELETE' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class DeleteConfirmationDialog {
  dialogRef = inject(MatDialogRef<DeleteConfirmationDialog>);
  data = inject<DeleteConfirmData>(MAT_DIALOG_DATA);
  confirmName = '';
  cancel() { this.dialogRef.close(false); }
  confirm() { this.dialogRef.close(true); }
}