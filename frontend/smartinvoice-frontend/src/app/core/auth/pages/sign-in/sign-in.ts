// features/auth/pages/sign-in/sign-in.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

function noSpacesValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && value.includes(' ')) {
    return { noSpaces: true };
  }
  return null;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  form: FormGroup;
  hidePassword = true;
  loading = false;
  returnUrl = '/dashboard';

  get darkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), noSpacesValidator]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
    });

    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      this.form.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    // ✅ Mark all fields as touched to trigger validation messages
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      // Show a snackbar with error message
      this.snackBar.open(
        this.translate.instant('AUTH.FIX_FORM_ERRORS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.loading = true;
    const { email, password, rememberMe } = this.form.value;

    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(this.translate.instant('AUTH.LOGIN_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.loading = false;
        let errorMsg = this.translate.instant('AUTH.LOGIN_ERROR');
        if (err.status === 401) errorMsg = this.translate.instant('AUTH.INVALID_CREDENTIALS');
        else if (err.status === 0) errorMsg = this.translate.instant('AUTH.NETWORK_ERROR');
        this.snackBar.open(errorMsg, this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
      }
    });
  }
}