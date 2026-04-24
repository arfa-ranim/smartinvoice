import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({ providedIn: 'root' })
export class PdfService {
  async generateInvoicePDF(invoiceData: any, companySettings: any): Promise<void> {
    // Create a temporary div with invoice HTML
    const element = document.createElement('div');
    element.innerHTML = this.generateInvoiceHTML(invoiceData, companySettings);
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice_${invoiceData.invoiceNumber}.pdf`);
    } finally {
      document.body.removeChild(element);
    }
  }

  private generateInvoiceHTML(invoiceData: any, company: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .logo img { max-height: 60px; }
          .company-info { text-align: right; }
          .invoice-title { font-size: 24px; font-weight: bold; color: ${company.accentColor || '#0f4b80'}; }
          .client-info { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: ${company.accentColor || '#0f4b80'}; color: white; }
          .totals { text-align: right; margin-top: 20px; }
          .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo">
              ${company.logoUrl ? `<img src="${company.logoUrl}" alt="Logo">` : '<h2>SmartInvoice</h2>'}
            </div>
            <div class="company-info">
              <strong>${company.companyName}</strong><br>
              ${company.address}<br>
              ${company.email} | ${company.phone}
            </div>
          </div>
          <div class="invoice-title">INVOICE</div>
          <div class="client-info">
            <strong>Bill To:</strong><br>
            ${invoiceData.clientName}<br>
            ${invoiceData.clientEmail}<br>
            ${invoiceData.clientCompany || ''}
          </div>
          <table>
            <thead><tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
            <tbody>
              ${invoiceData.lineItems.map((item: any) => `
                <tr><td>${item.description}</td><td>${item.quantity}</td><td>$${item.price}</td><td>$${item.quantity * item.price}</td></tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: $${invoiceData.subtotal}</p>
            <p>VAT (19%): $${invoiceData.vat}</p>
            <h3>Grand Total: $${invoiceData.grandTotal}</h3>
          </div>
          <div class="footer">
            ${company.legalNotice || 'Payment due within 30 days'}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}