// features/settings/settings/settings.ts

import { Component, OnInit, inject } from '@angular/core';
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
import { SettingsService } from '../../../core/services/settings.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/auth/auth.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ProductService } from '../../../core/services/product.service';
import { ClientService } from '../../../core/services/client.service';
import { EmailService } from '../../../core/services/email.service';
import { ResetConfirmDialog } from '../reset-confirm-dialog';
import { CompanyInfoComponent } from '../components/company-info.component';
import { BrandingComponent } from '../components/branding.component';
// ✅ REMOVED: InvoiceDefaultsComponent is not used in template
import { BottomNav } from '../../..//core/layout/bottom-nav/bottom-nav'

interface CompanySettings {
  companyName: string;
  legalStatus: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
  accentColor: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultDueDays: number;
  defaultPaymentMethod: string;
  lateFeePercent: number;
  defaultTaxRate: number;
  internationalTaxRule: string;
  stripeEnabled: boolean;
  stripeTestKey: string;
  qrCodeEnabled: boolean;
  emailReminders: boolean;
  reminderDaysBefore: number;
  bccCopy: boolean;
  legalNotice: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    BottomNav,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslateModule,
    Sidebar,
    TopBar,
    // ✅ REMOVED: InvoiceDefaultsComponent,
    CompanyInfoComponent,
    BrandingComponent,
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private layoutService = inject(LayoutService);
  private settingsService = inject(SettingsService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private invoiceService = inject(InvoiceService);
  private productService = inject(ProductService);
  private clientService = inject(ClientService);
  private translate = inject(TranslateService);
  private emailService = inject(EmailService);

  settingsForm!: FormGroup;
  logoPreview = '';
  showStripeKey = false;

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  paymentMethods = ['Bank Transfer', 'Stripe', 'Cheque'];
  taxRates = [0, 5.5, 10, 20];
  internationalRules = ['Reverse charge', 'Exempt', 'Standard VAT'];

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      companyName: ['', Validators.required],
      legalStatus: [''],
      taxId: [''],
      address: [''],
      email: ['', [Validators.email]],
      phone: [''],
      website: [''],
      logoUrl: [''],
      accentColor: ['#0f4b80'],
      invoicePrefix: ['INV-'],
      nextInvoiceNumber: [1, Validators.min(1)],
      defaultDueDays: [30, Validators.min(0)],
      defaultPaymentMethod: ['Bank Transfer'],
      lateFeePercent: [0, Validators.min(0)],
      defaultTaxRate: [20],
      internationalTaxRule: ['Standard VAT'],
      stripeEnabled: [false],
      stripeTestKey: ['pk_test_xxxx'],
      qrCodeEnabled: [true],
      emailReminders: [true],
      reminderDaysBefore: [3],
      bccCopy: [false],
      legalNotice: ['']
    });
  }

  private loadSettings(): void {
    const stored = localStorage.getItem('smartinvoice_company_settings');
    if (stored) {
      const settings: CompanySettings = JSON.parse(stored);
      this.settingsForm.patchValue(settings);
      this.logoPreview = settings.logoUrl || '';
      this.applyAccentColor(settings.accentColor);
    } else {
      const defaultSettings = {
        companyName: 'Acme Solutions Inc.',
        legalStatus: 'SARL',
        taxId: 'FR123456789',
        address: '123 Business Avenue, Silicon Valley, CA 94025',
        email: 'billing@acme.com',
        phone: '+1 (555) 000-1234',
        website: 'https://acme.com',
        logoUrl: '',
        accentColor: '#0f4b80',
        invoicePrefix: 'INV-',
        nextInvoiceNumber: 124,
        defaultDueDays: 30,
        defaultPaymentMethod: 'Bank Transfer',
        lateFeePercent: 5,
        defaultTaxRate: 20,
        internationalTaxRule: 'Standard VAT',
        stripeEnabled: false,
        stripeTestKey: 'pk_test_xxxx',
        qrCodeEnabled: true,
        emailReminders: true,
        reminderDaysBefore: 3,
        bccCopy: false,
        legalNotice: 'Payment due within 30 days. Late payments subject to 5% fee.'
      };
      this.settingsForm.patchValue(defaultSettings);
      this.applyAccentColor('#0f4b80');
    }
  }

  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.logoPreview = base64;
        this.settingsForm.patchValue({ logoUrl: base64 });
        this.snackBar.open(this.translate.instant('SETTINGS.LOGO_UPLOADED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
      };
      reader.readAsDataURL(file);
    }
  }

  toggleShowStripeKey(): void {
    this.showStripeKey = !this.showStripeKey;
  }

  applyAccentColor(color: string): void {
    document.documentElement.style.setProperty('--primary', color);
  }

  onAccentColorChange(): void {
    const color = this.settingsForm.get('accentColor')?.value;
    this.applyAccentColor(color);
  }

  toggleTheme(): void {
    this.settingsService.toggleTheme();
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.snackBar.open(this.translate.instant('SETTINGS.FILL_REQUIRED_FIELDS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      return;
    }
    localStorage.setItem('smartinvoice_company_settings', JSON.stringify(this.settingsForm.value));
    this.snackBar.open(this.translate.instant('SETTINGS.SETTINGS_SAVED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
  }

  async exportData(): Promise<void> {
    const invoices = await this.invoiceService.getAllInvoices().toPromise();
    const products = await this.productService.getProducts().toPromise();
    const clients = await this.clientService.getClients().toPromise();
    const companySettings = localStorage.getItem('smartinvoice_company_settings');
    const userProfile = localStorage.getItem('smartinvoice_user_profile');

    const exportData = {
      companySettings: companySettings ? JSON.parse(companySettings) : null,
      userProfile: userProfile ? JSON.parse(userProfile) : null,
      invoices: invoices || [],
      products: products || [],
      clients: clients || []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartinvoice_export_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open(this.translate.instant('SETTINGS.EXPORT_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
  }

  resetDemoData(): void {
    const dialogRef = this.dialog.open(ResetConfirmDialog, {
      width: '500px',
      data: {
        items: [
          this.translate.instant('SETTINGS.COMPANY_SETTINGS'),
          this.translate.instant('SETTINGS.USER_PROFILE'),
          this.translate.instant('SETTINGS.INVOICES'),
          this.translate.instant('SETTINGS.PRODUCTS'),
          this.translate.instant('SETTINGS.CLIENTS')
        ]
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        localStorage.clear();
        this.loadSettings();
        this.snackBar.open(this.translate.instant('SETTINGS.RESET_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        setTimeout(() => window.location.reload(), 1500);
        window.location.reload();
      }
    });
  }

  testEmailNotification(): void {
    this.emailService.sendTestEmail().subscribe({
      next: () => this.snackBar.open(
        this.translate.instant('SETTINGS.TEST_EMAIL_SENT'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      ),
      error: () => this.snackBar.open(
        this.translate.instant('SETTINGS.TEST_EMAIL_FAILED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      )
    });
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  cancel(): void {
    this.loadSettings();
    this.snackBar.open(
      this.translate.instant('SETTINGS.CHANGES_DISCARDED'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 2000 }
    );
  }
}