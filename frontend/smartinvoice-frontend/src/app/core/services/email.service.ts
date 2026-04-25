import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmailService {

    sendPaymentReminder(to: string, invoiceId: string, amount: number, paymentLink?: string): Observable<boolean> {
      const link = paymentLink || `${window.location.origin}/payments/invoice/${invoiceId}`;
      console.log(`Sending reminder to ${to} for invoice ${invoiceId}, amount ${amount}. Link: ${link}`);
      return of(true).pipe(delay(500));
    }

  sendLowStockAlert(productName: string, currentStock: number, threshold: number): Observable<boolean> {
    console.log(`[EMAIL SIMULATION] Low stock alert for ${productName}: only ${currentStock} units left (threshold: ${threshold})`);
    return of(true).pipe(delay(500));
  }

    sendTestEmail(): Observable<{ success: boolean; message: string }> {
    // Simulate API call
    return of({ success: true, message: 'Test email sent successfully' }).pipe(delay(500));
  }
}