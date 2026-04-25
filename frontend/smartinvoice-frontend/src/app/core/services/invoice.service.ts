import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface LineItem {
  description: string;
  quantity: number;
  price: number;
  productId?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  client: string;
  clientInitials: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: Date;
  notes?: string;
  lineItems?: LineItem[];
  pdfUrl?: string;
  invoiceType: 'sales' | 'purchase';   
  supplierName?: string;      
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
private allInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    clientId: '1',
    client: 'Acme Corp',
    clientInitials: 'AC',
    amount: 2450.00,
    status: 'paid',
    dueDate: new Date(2024, 4, 12),
    notes: 'Paid on time',
    lineItems: [{ description: 'Web design', quantity: 1, price: 2450 }],
    invoiceType: 'sales'
  },
  {
    id: 'INV-2024-002',
    clientId: '2',
    client: 'Global Solutions',
    clientInitials: 'GS',
    amount: 1200.00,
    status: 'pending',
    dueDate: new Date(2024, 5, 5),
    lineItems: [{ description: 'Consulting', quantity: 2, price: 600 }],
    invoiceType: 'sales'
  },
  // Purchase invoices (you owe money)
  {
    id: 'PUR-2024-001',
    clientId: 'supplier1',
    client: 'Office Supplies Inc',
    clientInitials: 'OS',
    amount: 450.00,
    status: 'pending',
    dueDate: new Date(2024, 5, 20),
    lineItems: [{ description: 'Printer paper', quantity: 10, price: 45 }],
    invoiceType: 'purchase'
  },
  {
    id: 'PUR-2024-002',
    clientId: 'supplier2',
    client: 'Web Hosting Ltd',
    clientInitials: 'WH',
    amount: 299.00,
    status: 'paid',
    dueDate: new Date(2024, 4, 10),
    lineItems: [{ description: 'Hosting renewal', quantity: 1, price: 299 }],
    invoiceType: 'purchase'
  }
];

  getAllInvoices(): Observable<Invoice[]> {
    return of(this.allInvoices).pipe(delay(300));
  }

  getInvoiceById(id: string): Observable<Invoice | undefined> {
    return of(this.allInvoices.find(i => i.id === id)).pipe(delay(100));
  }

  updateInvoiceStatus(id: string, status: 'paid' | 'pending' | 'overdue'): Observable<Invoice> {
    const index = this.allInvoices.findIndex(i => i.id === id);
    if (index !== -1) {
      this.allInvoices[index].status = status;
    }
    return of(this.allInvoices[index]).pipe(delay(200));
  }
 updateInvoice(invoice: Invoice): Observable<Invoice> {
    const index = this.allInvoices.findIndex(i => i.id === invoice.id);
    if (index !== -1) {
      this.allInvoices[index] = invoice;
    }
    return of(invoice).pipe(delay(300));
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    this.allInvoices.push(invoice);
    return of(invoice).pipe(delay(300));
  }

  getInvoices(page: number, pageSize: number, search: string, monthFilter?: number): Observable<{ data: Invoice[]; total: number }> {
    let filtered = [...this.allInvoices];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(inv =>
        inv.id.toLowerCase().includes(q) ||
        inv.client.toLowerCase().includes(q)
      );
    }

    if (monthFilter !== undefined && monthFilter !== null) {
      filtered = filtered.filter(inv => inv.dueDate.getMonth() === monthFilter);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return of({ data, total }).pipe(delay(300));
  }

  previewInvoice(id: string): Observable<string> {
    const inv = this.allInvoices.find(i => i.id === id);
    return of(inv?.pdfUrl || '');
  }

  downloadInvoice(id: string): Observable<Blob> {
    const content = `Fake PDF content for invoice ${id}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    return of(blob).pipe(delay(200));
  }
}