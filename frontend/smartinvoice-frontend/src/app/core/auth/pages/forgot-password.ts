import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink, TranslateModule],
  template: `
    <div class="forgot-container">
      <div class="top-logo" (click)="goToSignIn()">
        <mat-icon>receipt_long</mat-icon>
        <span>SmartInvoice</span>
      </div>

      <mat-card class="forgot-card">
        <h2>{{ 'AUTH.RESET_PASSWORD' | translate }}</h2>
        <p>{{ 'AUTH.RESET_PASSWORD_DESC' | translate }}</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
            <mat-icon matPrefix>mail_outline</mat-icon>
            <input matInput formControlName="email" type="email" required>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid" class="submit-btn">
            {{ 'AUTH.SEND_RESET_LINK' | translate }}
          </button>
        </form>
        <p class="back-link"><a routerLink="/auth/sign-in">← {{ 'AUTH.BACK_TO_SIGN_IN' | translate }}</a></p>
      </mat-card>
    </div>
  `,
  styles: [`
    .forgot-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: var(--bg-light);
      position: relative;
    }
    .top-logo {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: var(--primary);
      font-weight: 600;
      transition: opacity 0.2s;
      z-index: 10;
    }
    .top-logo:hover { opacity: 0.8; }
    .top-logo mat-icon { font-size: 24px; }
    .forgot-card {
      max-width: 450px;
      width: 100%;
      padding: 2rem;
      border-radius: 20px;
      background: var(--card-light);
      border: 1px solid var(--border-light);
    }
    .full-width { width: 100%; margin-bottom: 1rem; }
    .back-link { margin-top: 1.5rem; text-align: center; }
    .back-link a { color: var(--primary); text-decoration: none; font-size: 0.875rem; }
    .back-link a:hover { text-decoration: underline; }
    .submit-btn { width: 100%; padding: 0.5rem; background: var(--accent-green) !important; color: white !important; }
    body.dark-mode .forgot-card { background: var(--card-dark); border-color: var(--border-dark); }
    body.dark-mode .top-logo { color: var(--accent-gold); }
    body.dark-mode .back-link a { color: var(--accent-gold); }
  `]
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private translate = inject(TranslateService);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.snackBar.open(this.translate.instant('AUTH.RESET_LINK_SENT'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      this.form.reset();
    }
  }

  goToSignIn() {
    this.router.navigate(['/auth/sign-in']);
  }
}