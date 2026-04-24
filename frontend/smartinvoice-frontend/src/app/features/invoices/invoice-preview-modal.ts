import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Invoice } from '../../core/services/invoice.service';   
import { CurrencyPipe } from '../../shared/pipes/currency.pipe'; 
import { EmailService } from '../../core/services/email.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-invoice-preview-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, MatSnackBarModule, TranslateModule, CurrencyPipe],
  template: `
    <div class="preview-modal">
      <div class="modal-header">
        <div class="header-info">
          <mat-icon [class]="data.invoiceType === 'sales' ? 'sales-icon' : 'purchase-icon'">
            {{ data.invoiceType === 'sales' ? 'receipt' : 'shopping_cart' }}
          </mat-icon>
          <h2>{{ data.invoiceType === 'sales' ? 'INVOICE' : 'PURCHASE INVOICE' }}</h2>
        </div>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="modal-body">
        <!-- Company Header -->
        <div class="company-section">
          <div class="company-logo">
            <mat-icon>description</mat-icon>
            <h3>SmartInvoice</h3>
          </div>
          <div class="company-details">
            <p>123 Business Street</p>
            <p>contact@smartinvoice.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
        </div>

        <!-- Client/Supplier Info -->
        <div class="info-section">
          <div class="bill-info">
            <label>{{ data.invoiceType === 'sales' ? 'Bill To:' : 'Supplier:' }}</label>
            <h4>{{ data.client }}</h4>
            <p *ngIf="data.clientId === 'supplier1'">Office Supplies Inc</p>
            <p *ngIf="data.clientId !== 'supplier1'">{{ data.client }}</p>
          </div>
          
          <div class="invoice-meta">
            <div class="meta-item">
              <span class="meta-label">Invoice #</span>
              <span class="meta-value">{{ data.id }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date</span>
              <span class="meta-value">{{ data.dueDate | date }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Status</span>
              <span class="status-badge" [class]="data.status">
                <span class="status-dot"></span>
                {{ data.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="items-table-wrapper">
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              @for (item of data.lineItems; track $index) {
                <tr>
                  <td>{{ item.description }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right">{{ item.price | appCurrency }}</td>
                  <td class="text-right total-cell">{{ item.quantity * item.price | appCurrency }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="totals-section">
          <div class="totals-line">
            <span>Subtotal</span>
            <span>{{ subtotal | appCurrency }}</span>
          </div>
          <div class="totals-line">
            <span>VAT (19%)</span>
            <span>{{ vat | appCurrency }}</span>
          </div>
          <div class="totals-divider"></div>
          <div class="totals-line grand-total">
            <span>Grand Total</span>
            <span>{{ grandTotal | appCurrency }}</span>
          </div>
        </div>

        <!-- Bank Details (for sales invoices) -->
        @if (data.invoiceType === 'sales') {
          <div class="bank-details">
            <div class="bank-header">
              <mat-icon>account_balance</mat-icon>
              <span>Bank Transfer Details</span>
            </div>
            <div class="bank-content">
              <p><strong>IBAN:</strong> TN59 1234 5678 9012 3456 7890</p>
              <p><strong>BIC:</strong> BNTNTTTT</p>
              <p><strong>Beneficiary:</strong> SmartInvoice Ltd</p>
            </div>
          </div>
        }

        <!-- Actions -->
        <div class="modal-actions">
          @if (data.invoiceType === 'sales') {
            <button class="action-btn copy-btn" (click)="copyPaymentLink()">
              <mat-icon>link</mat-icon>
              Copy payment link
            </button>
            <button class="action-btn email-btn" (click)="sendReminder()">
              <mat-icon>email</mat-icon>
              Send reminder
            </button>
          }
          @if (data.invoiceType === 'purchase' && data.status !== 'paid') {
            <button class="action-btn pay-btn" (click)="markAsPaid()">
              <mat-icon>payment</mat-icon>
              Mark as paid
            </button>
          }
          <button class="action-btn pdf-btn" (click)="downloadPDF()">
            <mat-icon>picture_as_pdf</mat-icon>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-modal {
      max-width: 800px;
      background: var(--card-light);
      border-radius: 24px;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-info mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-info h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .close-btn {
      color: white !important;
      background: rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }

    .modal-body {
      padding: 1.5rem;
    }

    /* Company Section */
    .company-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--border-light);
    }

    .company-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .company-logo mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--primary);
    }

    .company-logo h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .company-details {
      text-align: right;
      font-size: 0.75rem;
      color: var(--text-secondary-light);
    }

    .company-details p {
      margin: 0.125rem 0;
    }

    /* Info Section */
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .bill-info label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }

    .bill-info h4 {
      margin: 0.25rem 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-light);
    }

    .bill-info p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary-light);
    }

    .invoice-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
    }

    .meta-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }

    .meta-value {
      font-weight: 600;
      color: var(--text-light);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-badge.paid {
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      color: #155724;
    }

    .status-badge.pending {
      background: linear-gradient(135deg, #fff3cd, #ffeaa7);
      color: #856404;
    }

    .status-badge.overdue {
      background: linear-gradient(135deg, #f8d7da, #f5c6cb);
      color: #721c24;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .status-badge.paid .status-dot { background: #00b894; }
    .status-badge.pending .status-dot { background: #f39c12; }
    .status-badge.overdue .status-dot { background: #ef4444; }

    /* Items Table */
    .items-table-wrapper {
      overflow-x: auto;
      margin-bottom: 1.5rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th {
      padding: 0.75rem;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      background: var(--table-header-bg);
      border-bottom: 2px solid var(--border-light);
    }

    .items-table td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border-light);
      color: var(--text-light);
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .total-cell {
      font-weight: 800;
      color: var(--primary);
    }

    /* Totals Section */
    .totals-section {
      background: var(--bg-light);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      max-width: 300px;
      margin-left: auto;
    }

    .totals-line {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }

    .totals-divider {
      height: 1px;
      background: var(--border-light);
      margin: 0.5rem 0;
    }

    .grand-total {
      font-size: 1.125rem;
      font-weight: 800;
    }

    .grand-total span:last-child {
      color: var(--primary);
      font-size: 1.25rem;
    }

    /* Bank Details */
    .bank-details {
      background: linear-gradient(135deg, rgba(15, 75, 128, 0.05), rgba(0, 0, 0, 0.02));
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border: 1px solid var(--border-light);
    }

    .bank-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .bank-header mat-icon {
      color: var(--primary);
    }

    .bank-header span {
      font-weight: 700;
      color: var(--text-light);
    }

    .bank-content p {
      margin: 0.25rem 0;
      font-size: 0.75rem;
      color: var(--text-secondary-light);
    }

    /* Modal Actions */
    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.625rem 1.25rem;
      border-radius: 40px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
    }

    .copy-btn {
      background: linear-gradient(135deg, #0F4C81, #1a6b9e);
      color: white;
    }

    .email-btn {
      background: linear-gradient(135deg, #FFC107, #FFA000);
      color: #1e293b;
    }

    .pay-btn {
      background: linear-gradient(135deg, #00b894, #00cec9);
      color: white;
    }

    .pdf-btn {
      background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
      color: #1e293b;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Dark Mode */
    :host-context(body.dark-mode) .modal-header {
      background: linear-gradient(135deg, #FFC107, #FFA000);
      color: #1a1a2e;
    }

    :host-context(body.dark-mode) .company-logo mat-icon {
      color: #FFC107;
    }

    :host-context(body.dark-mode) .company-logo h3 {
      background: linear-gradient(135deg, #FFC107, #FFA000);
      -webkit-background-clip: text;
      background-clip: text;
    }

    :host-context(body.dark-mode) .total-cell {
      color: #FFC107;
    }

    :host-context(body.dark-mode) .grand-total span:last-child {
      color: #FFC107;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .modal-body {
        padding: 1rem;
      }

      .info-section {
        flex-direction: column;
      }

      .invoice-meta {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .totals-section {
        max-width: 100%;
      }

      .modal-actions {
        flex-direction: column;
      }

      .action-btn {
        justify-content: center;
      }
    }
  `]
})
export class InvoicePreviewModal {
  dialogRef = inject(MatDialogRef<InvoicePreviewModal>);
  snackBar = inject(MatSnackBar);
  emailService = inject(EmailService);
  translate = inject(TranslateService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: Invoice) {}

  get subtotal(): number {
    return this.data.lineItems?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;
  }
  get vat(): number {
    return this.subtotal * 0.19;
  }
  get grandTotal(): number {
    return this.subtotal + this.vat;
  }

  copyPaymentLink() {
    const link = `${window.location.origin}/payments/invoice/${this.data.id}`;
    navigator.clipboard.writeText(link);
    this.snackBar.open(this.translate.instant('INVOICES.LINK_COPIED'), 'OK', { duration: 2000 });
  }

  sendReminder() {
    const link = `${window.location.origin}/payments/invoice/${this.data.id}`;
    this.emailService.sendPaymentReminder(this.data.client, this.data.id, this.data.amount, link).subscribe(() => {
      this.snackBar.open(this.translate.instant('INVOICES.REMINDER_SENT'), 'OK', { duration: 3000 });
    });
  }

  markAsPaid() {
    this.dialogRef.close({ action: 'markPaid' });
  }

  // Real PDF Download functionality
  downloadPDF(): void {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFillColor(15, 75, 128);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(this.data.invoiceType === 'sales' ? 'INVOICE' : 'PURCHASE INVOICE', pageWidth / 2, 25, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      yPos = 55;

      // Company Info (Left)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SmartInvoice', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('123 Business Street', 20, yPos + 6);
      doc.text('contact@smartinvoice.com', 20, yPos + 12);
      doc.text('+1 (555) 123-4567', 20, yPos + 18);

      // Invoice Info (Right)
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Details:', pageWidth - 60, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: ${this.data.id}`, pageWidth - 60, yPos + 6);
      doc.text(`Date: ${new Date(this.data.dueDate).toLocaleDateString()}`, pageWidth - 60, yPos + 12);
      doc.text(`Status: ${this.data.status.toUpperCase()}`, pageWidth - 60, yPos + 18);
      
      yPos += 35;

      // Client Info
      doc.setFillColor(245, 247, 250);
      doc.rect(20, yPos, pageWidth - 40, 30, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(this.data.invoiceType === 'sales' ? 'Bill To:' : 'Supplier:', 25, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(this.data.client, 25, yPos + 16);
      doc.text(this.data.clientId === 'supplier1' ? 'Office Supplies Inc' : this.data.client, 25, yPos + 24);
      
      yPos += 45;

      // Line Items Table
      const tableData = this.data.lineItems?.map(item => [
        item.description,
        item.quantity.toString(),
        `${item.price.toFixed(2)} €`,
        `${(item.quantity * item.price).toFixed(2)} €`
      ]) || [];

      autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Quantity', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 75, 128], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Totals
      const totalsX = pageWidth - 80;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Subtotal:', totalsX, yPos);
      doc.text(`${this.subtotal.toFixed(2)} €`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text('VAT (19%):', totalsX, yPos);
      doc.text(`${this.vat.toFixed(2)} €`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.setDrawColor(200, 200, 200);
      doc.line(totalsX - 10, yPos, pageWidth - 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Grand Total:', totalsX, yPos);
      doc.setTextColor(15, 75, 128);
      doc.text(`${this.grandTotal.toFixed(2)} €`, pageWidth - 20, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      
      yPos += 20;

      // Bank Details (for sales invoices)
      if (this.data.invoiceType === 'sales') {
        doc.setFillColor(245, 247, 250);
        doc.rect(20, yPos, pageWidth - 40, 45, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Bank Transfer Details', 25, yPos + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('IBAN: TN59 1234 5678 9012 3456 7890', 25, yPos + 18);
        doc.text('BIC: BNTNTTTT', 25, yPos + 26);
        doc.text('Beneficiary: SmartInvoice Ltd', 25, yPos + 34);
        yPos += 55;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 12, { align: 'center' });

      // Save PDF
      doc.save(`invoice_${this.data.id}.pdf`);
      
      this.snackBar.open(this.translate.instant('INVOICES.PDF_DOWNLOADED'), 'OK', { duration: 3000 });
    } catch (error) {
      console.error('PDF generation error:', error);
      this.snackBar.open('Error generating PDF', 'OK', { duration: 3000 });
    }
  }

  close() {
    this.dialogRef.close();
  }
}