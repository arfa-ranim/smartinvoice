// features/payments/payments/payments.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { InvoiceService, Invoice } from '../../../core/services/invoice.service';
import { ClientService, Client } from '../../../core/services/client.service';
import QRCode from 'qrcode';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatIconModule, MatDialogModule,CommonModule, 
    MatSnackBarModule, MatInputModule, MatButtonModule, Sidebar, BottomNav, TopBar, TranslateModule
  ],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss']
})

export class Payments implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  currencyService = inject(CurrencyService);

  invoice: Invoice | null = null;
  client: Client | null = null;
  loading = true;
  error = false;

  cardNumber = '4242 4242 4242 4242';
  cardExpiry = '12/28';
  cardCvc = '123';
  isProcessing = false;
  qrCodeDataUrl: string | null = null;
  showQrModal = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const invoiceId = params['id'];
      if (invoiceId) {
        this.loadInvoice(invoiceId);
      } else {
        this.error = true;
        this.loading = false;
        this.snackBar.open(this.translate.instant('PAYMENTS.NO_INVOICE_ID'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up any pending operations
  }

  loadInvoice(id: string): void {
    this.invoiceService.getInvoiceById(id).subscribe(inv => {
      if (inv) {
        this.invoice = inv;
        this.loadClient(inv.clientId);
      } else {
        this.error = true;
        this.snackBar.open(this.translate.instant('PAYMENTS.INVOICE_NOT_FOUND'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
      this.loading = false;
    });
  }

  loadClient(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe(client => {
      this.client = client ?? null;
    });
  }

  get subtotal(): number {
    if (!this.invoice?.lineItems) return 0;
    return this.invoice.lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get vat(): number {
    return this.subtotal * 0.19;
  }

  get grandTotal(): number {
    return this.subtotal + this.vat;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  onViewPDF(): void {
    if (this.invoice) {
      this.invoiceService.previewInvoice(this.invoice.id).subscribe(url => {
        if (url) window.open(url, '_blank');
        else alert(this.translate.instant('PAYMENTS.PDF_NOT_AVAILABLE'));
      });
    }
  }

  // Fixed: Normalize card number by removing spaces
  private normalizeCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\s/g, '');
  }

  // Fixed: Accept both formatted and unformatted card numbers
  private isValidTestCard(cardNumber: string): boolean {
    const normalized = this.normalizeCardNumber(cardNumber);
    return normalized === '4242424242424242';
  }

  async onGenerateQRCode(): Promise<void> {
    if (!this.invoice) return;
    const paymentUrl = `${window.location.origin}/payments/invoice/${this.invoice.id}`;
    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#0f4b80', light: '#ffffff' }
      });
      this.showQrModal = true;
    } catch (err) {
      console.error('QR generation failed:', err);
      this.snackBar.open(this.translate.instant('PAYMENTS.QR_FAILED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    }
  }

  downloadQRCode(): void {
    if (!this.qrCodeDataUrl) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `payment_qr_${this.invoice?.id}.png`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    this.snackBar.open(this.translate.instant('PAYMENTS.QR_DOWNLOADED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
  }

  closeQrModal(): void {
    this.showQrModal = false;
    // Clear QR code data to free memory
    setTimeout(() => {
      this.qrCodeDataUrl = null;
    }, 300);
  }

  async onPayWithStripe(): Promise<void> {
    if (!this.invoice) {
      this.snackBar.open(this.translate.instant('PAYMENTS.INVOICE_NOT_FOUND'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      return;
    }
    
    this.isProcessing = true;

    // Fixed: Validate card number with spaces or without
    const isValidCard = this.isValidTestCard(this.cardNumber);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isValidCard) {
      this.invoiceService.updateInvoiceStatus(this.invoice.id, 'paid').subscribe({
        next: () => {
          this.isProcessing = false;
          this.snackBar.open(
            this.translate.instant('PAYMENTS.PAYMENT_SUCCESS'), 
            this.translate.instant('COMMON.CLOSE'), 
            { duration: 4000 }
          );
          this.router.navigate(['/invoices']);
        },
        error: () => {
          this.isProcessing = false;
          this.snackBar.open(
            this.translate.instant('PAYMENTS.PAYMENT_FAILED'), 
            this.translate.instant('COMMON.CLOSE'), 
            { duration: 4000 }
          );
        }
      });
    } else {
      this.isProcessing = false;
      this.snackBar.open(
        this.translate.instant('PAYMENTS.INVALID_CARD'), 
        this.translate.instant('COMMON.CLOSE'), 
        { duration: 5000 }
      );
    }
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }
}