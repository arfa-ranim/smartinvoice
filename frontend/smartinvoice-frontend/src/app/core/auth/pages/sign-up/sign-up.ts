import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth.service';
import { ThemeService } from '../../../services/theme.service';
import { passwordStrengthValidator, noSpacesValidator } from '../../../../shared/validators/custom-validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Typed form value interface
interface SignUpFormValue {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
  terms: boolean;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatSnackBarModule, RouterLink, TranslateModule
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  // Typed form with nonNullable
 form!: FormGroup;
  hidePassword = true;
  loading = false;

  get darkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  benefits = [
    { icon: 'speed', titleKey: 'AUTH.BENEFITS.FAST_PAYMENTS.TITLE', descKey: 'AUTH.BENEFITS.FAST_PAYMENTS.DESC' },
    { icon: 'auto_awesome', titleKey: 'AUTH.BENEFITS.AUTOMATION.TITLE', descKey: 'AUTH.BENEFITS.AUTOMATION.DESC' },
    { icon: 'monitoring', titleKey: 'AUTH.BENEFITS.SMART_ANALYTICS.TITLE', descKey: 'AUTH.BENEFITS.SMART_ANALYTICS.DESC' },
    { icon: 'security', titleKey: 'AUTH.BENEFITS.SECURITY.TITLE', descKey: 'AUTH.BENEFITS.SECURITY.DESC' }
  ];

  constructor() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator, noSpacesValidator]],
      terms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['company']) {
        this.form.patchValue({ companyName: params['company'] });
      }
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  getPasswordStrength(): { label: string; color: string; width: number } {
    const pass = this.form.get('password')?.value || '';
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++;
    const percent = (strength / 5) * 100;
    if (strength <= 2) return { label: this.translate.instant('AUTH.PASSWORD_WEAK'), color: '#ef4444', width: percent };
    if (strength <= 3) return { label: this.translate.instant('AUTH.PASSWORD_MEDIUM'), color: '#f59e0b', width: percent };
    return { label: this.translate.instant('AUTH.PASSWORD_STRONG'), color: '#10b981', width: percent };
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password, fullName } = this.form.getRawValue();

    this.authService.register(email, password, fullName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(this.translate.instant('AUTH.REGISTRATION_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open(this.translate.instant('AUTH.REGISTRATION_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
      }
    });
  }
}