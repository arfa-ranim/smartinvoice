import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { LayoutService } from '../../../core/services/layout.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SettingsService, Language } from '../../../core/services/settings.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ImageCropperDialog } from './image-cropper-dialog';
import { DeleteAccountDialog } from './delete-account-dialog';
import { CurrencyService } from '../../../core/services/currency.service';
import { passwordMatchValidator, passwordStrengthValidator, noSpacesValidator } from '../../../shared/validators/custom-validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ProfileFormValue {
  fullName: string;
  email: string;
  phone: string;
  language: Language;
  dateFormat: string;
  currency: string;
  stripeAccountId: string;
}

interface PasswordFormValue {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslateModule,
    Sidebar,
    TopBar
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private layoutService = inject(LayoutService);
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private themeService = inject(ThemeService);
  private currencyService = inject(CurrencyService);
  private translate = inject(TranslateService);

  // ✅ IMPORTANT FIX: remove generics
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  avatarPreview = '';
  defaultAvatar = 'https://ui-avatars.com/api/?background=0f4b80&color=fff&bold=true&size=128&name=';

  sessions = [
    { id: '1', device: 'Chrome on Windows', location: 'Paris, France', lastActive: '2 minutes ago', isCurrent: true },
    { id: '2', device: 'Safari on iPhone', location: 'Paris, France', lastActive: '3 hours ago' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ];

  dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }
  ];

  currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'TND', label: 'TND (DT)' }
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  private initForms(): void {
    this.profileForm = this.fb.nonNullable.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      language: ['en' as Language],
      dateFormat: ['DD/MM/YYYY'],
      currency: ['EUR'],
      stripeAccountId: ['']
    });

    this.passwordForm = this.fb.nonNullable.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.minLength(6),
        passwordStrengthValidator,
        noSpacesValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  getPasswordStrength(): { label: string; color: string; width: number } {
    const pass = this.passwordForm.get('newPassword')?.value || '';
    let strength = 0;

    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++;

    const percent = (strength / 5) * 100;

    if (strength <= 2) {
      return { label: this.translate.instant('PROFILE.PASSWORD_WEAK'), color: '#ef4444', width: percent };
    }

    if (strength <= 3) {
      return { label: this.translate.instant('PROFILE.PASSWORD_MEDIUM'), color: '#f59e0b', width: percent };
    }

    return { label: this.translate.instant('PROFILE.PASSWORD_STRONG'), color: '#10b981', width: percent };
  }

  private loadProfile(): void {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      const user = JSON.parse(userStr);

      this.profileForm.patchValue({
        fullName: user.name || user.fullName || 'Alex Rivera',
        email: user.email || 'alex@smartinvoice.com',
        phone: user.phone || '+1 (555) 123-4567',
        language: user.language || 'en',
        dateFormat: user.dateFormat || 'DD/MM/YYYY',
        currency: user.currency || 'EUR',
        stripeAccountId: user.stripeAccountId || ''
      });

      this.avatarPreview = user.avatarUrl || this.defaultAvatar + encodeURIComponent(user.name || 'User');

    } else {
      this.profileForm.patchValue({
        fullName: 'Alex Rivera',
        email: 'alex@smartinvoice.com',
        phone: '+1 (555) 123-4567',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR',
        stripeAccountId: ''
      });

      this.avatarPreview = this.defaultAvatar + 'Alex%20Rivera';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

async onAvatarClick(): Promise<void> {
  // Dynamically import the dialog component
  const { ImageCropperDialog } = await import('./image-cropper-dialog');
  
  const dialogRef = this.dialog.open(ImageCropperDialog, {
    width: '600px',
    data: { currentImage: this.avatarPreview }
  });

  dialogRef.afterClosed()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(result => {
      if (result) {
        this.avatarPreview = result;
        this.snackBar.open(
          this.translate.instant('PROFILE.AVATAR_UPDATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
}

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.snackBar.open(
        this.translate.instant('PROFILE.FILL_REQUIRED_FIELDS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    const formValue = this.profileForm.getRawValue() as ProfileFormValue;

    this.currencyService.setCurrency(formValue.currency);

    const updatedUser = {
      name: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      avatarUrl: this.avatarPreview,
      language: formValue.language,
      dateFormat: formValue.dateFormat,
      currency: formValue.currency,
      stripeAccountId: formValue.stripeAccountId
    };

    const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
    const savedUser = { ...existingUser, ...updatedUser };

    localStorage.setItem('user', JSON.stringify(savedUser));

    this.settingsService.setLanguage(formValue.language);

    this.snackBar.open(
      this.translate.instant('PROFILE.PROFILE_SAVED'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000 }
    );
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.snackBar.open(
        this.translate.instant('PROFILE.FIX_PASSWORD_ERRORS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.snackBar.open(
      this.translate.instant('PROFILE.PASSWORD_CHANGED'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000 }
    );

    this.passwordForm.reset();
  }

  revokeSession(sessionId: string): void {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);

    this.snackBar.open(
      this.translate.instant('PROFILE.SESSION_REVOKED'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000 }
    );
  }

  signOutAllDevices(): void {
    this.sessions = this.sessions.filter(s => s.isCurrent);

    this.snackBar.open(
      this.translate.instant('PROFILE.SIGNED_OUT_ALL_DEVICES'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000 }
    );
  }

  deleteAccount(): void {
    const dialogRef = this.dialog.open(DeleteAccountDialog, { width: '400px' });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) {
          this.authService.logout();
          this.router.navigate(['/']);
        }
      });
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  cancel(): void {
    this.loadProfile();

    this.snackBar.open(
      this.translate.instant('PROFILE.CHANGES_DISCARDED'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 2000 }
    );
  }
}