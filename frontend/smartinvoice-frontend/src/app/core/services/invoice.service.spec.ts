import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { InvoiceService, Invoice } from './invoice.service';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllInvoices', () => {
    it('should return all invoices', async () => {
      const invoices = await firstValueFrom(service.getAllInvoices());
      expect(invoices.length).toBeGreaterThan(0);
      expect(invoices[0]).toHaveProperty('id');
      expect(invoices[0]).toHaveProperty('amount');
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice by id', async () => {
      const invoices = await firstValueFrom(service.getAllInvoices());
      const expectedInvoice = invoices[0];

      const invoice = await firstValueFrom(service.getInvoiceById(expectedInvoice.id));
      expect(invoice).toBeDefined();
      expect(invoice?.id).toBe(expectedInvoice.id);
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update invoice status', async () => {
      const invoices = await firstValueFrom(service.getAllInvoices());
      const invoice = invoices.find(i => i.status !== 'paid') || invoices[0];
      const newStatus = invoice.status === 'pending' ? 'paid' : 'pending';

      const updated = await firstValueFrom(service.updateInvoiceStatus(invoice.id, newStatus));
      expect(updated.status).toBe(newStatus);
    });
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      const newInvoice: Partial<Invoice> = {
        id: 'NEW-001',
        clientId: '1',
        client: 'Test Client',
        clientInitials: 'TC',
        amount: 500,
        status: 'pending',
        dueDate: new Date(),
        invoiceType: 'sales'
      };

      const invoice = await firstValueFrom(service.createInvoice(newInvoice as Invoice));
      expect(invoice.id).toBe('NEW-001');
      expect(invoice.amount).toBe(500);
    });
  });

  describe('getInvoices (paginated)', () => {
    it('should return paginated invoices', async () => {
      const result = await firstValueFrom(service.getInvoices(1, 5, ''));
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.total).toBeDefined();
    });

    it('should filter by search query', async () => {
      const result = await firstValueFrom(service.getInvoices(1, 10, 'Acme'));
      const allMatch = result.data.every(inv => 
        inv.id.toLowerCase().includes('acme') || 
        inv.client.toLowerCase().includes('acme')
      );
      expect(allMatch).toBe(true);
    });
  });
});