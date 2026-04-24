import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-quick-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatInputModule, TranslateModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>{{ 'INVOICES.QUICK_CREATE_CLIENT' | translate }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 1rem;">
          <mat-label>{{ 'CLIENTS.FULL_NAME' | translate }}</mat-label>
          <input matInput formControlName="name" [attr.aria-label]="'CLIENTS.FULL_NAME' | translate" required>
          <mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'CLIENTS.FULL_NAME_REQUIRED' | translate }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 1rem;">
          <mat-label>{{ 'CLIENTS.EMAIL' | translate }}</mat-label>
          <input matInput formControlName="email" type="email" [attr.aria-label]="'CLIENTS.EMAIL' | translate" required>
          <mat-error *ngIf="form.get('email')?.hasError('required')">{{ 'CLIENTS.EMAIL_REQUIRED' | translate }}</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">{{ 'CLIENTS.VALID_EMAIL_REQUIRED' | translate }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>{{ 'CLIENTS.COMPANY_NAME' | translate }}</mat-label>
          <input matInput formControlName="company" [attr.aria-label]="'CLIENTS.COMPANY_NAME' | translate">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-button color="primary" [disabled]="form.invalid" (click)="save()">{{ 'COMMON.CREATE' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class ClientQuickCreateDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ClientQuickCreateDialog>);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company: ['']
  });

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.valid) {
      const newClient = {
        name: this.form.value.name,
        email: this.form.value.email,
        company: this.form.value.company,
        status: 'active',
        outstanding: 0,
        initials: this.getInitials(this.form.value.name || ''),
        color: '#0F4C81'
      };
      this.clientService.addClient(newClient as any).subscribe({
        next: (client) => {
          this.snackBar.open(this.translate.instant('CLIENTS.CREATE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
          this.dialogRef.close(client);
        },
        error: () => {
          this.snackBar.open(this.translate.instant('CLIENTS.CREATE_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        }
      });
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}