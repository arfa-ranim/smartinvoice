import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateInvoice } from './create-invoice';
import { ClientService } from '../../../core/services/client.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ProductService } from '../../../core/services/product.service';
import { DraftService } from '../../../core/services/draft.service';

describe('CreateInvoice', () => {
  let component: CreateInvoice;
  let fixture: ComponentFixture<CreateInvoice>;
  let clientService: any;
  let invoiceService: any;

  const mockClients = [
    { id: '1', name: 'Client A', company: 'Company A', email: 'a@example.com', initials: 'CA', status: 'active', outstanding: 0, color: '#000' },
    { id: '2', name: 'Client B', company: 'Company B', email: 'b@example.com', initials: 'CB', status: 'active', outstanding: 0, color: '#000' }
  ];

  beforeEach(async () => {
    // Create spies using Vitest
    clientService = {
      getClients: vi.fn().mockReturnValue(of(mockClients))
    };
    invoiceService = {
      createInvoice: vi.fn().mockReturnValue(of({ id: 'NEW-001', amount: 500 }))
    };
    const productService = {
      getProducts: vi.fn().mockReturnValue(of([]))
    };
    const draftService = {
      saveDraft: vi.fn().mockReturnValue(of({})),
      getDrafts: vi.fn().mockReturnValue(of([]))
    };
    const router = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        CreateInvoice,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule
      ]
    })
    .overrideComponent(CreateInvoice, {
      set: {
        providers: [
          { provide: ClientService, useValue: clientService },
          { provide: InvoiceService, useValue: invoiceService },
          { provide: ProductService, useValue: productService },
          { provide: DraftService, useValue: draftService },
          { provide: Router, useValue: router }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInvoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one line item', () => {
    expect(component.lineItems.length).toBe(1);
  });

  it('should add a line item', () => {
    const initialCount = component.lineItems.length;
    component.addLineItem();
    expect(component.lineItems.length).toBe(initialCount + 1);
  });

  it('should remove a line item', () => {
    component.addLineItem();
    const initialCount = component.lineItems.length;
    component.removeLineItem(0);
    expect(component.lineItems.length).toBe(initialCount - 1);
  });

  it('should not remove the last line item', () => {
    while (component.lineItems.length > 1) {
      component.removeLineItem(0);
    }
    expect(component.lineItems.length).toBe(1);
    
    component.removeLineItem(0);
    expect(component.lineItems.length).toBe(1);
  });

  it('should calculate subtotal correctly', () => {
    const lineItem = component.lineItems.at(0);
    lineItem.patchValue({ quantity: 2, price: 50 });
    expect(component.subtotal).toBe(100);
  });

  it('should calculate VAT correctly', () => {
    const lineItem = component.lineItems.at(0);
    lineItem.patchValue({ quantity: 2, price: 50 });
    expect(component.vat).toBe(19);
  });

  it('should calculate grand total correctly', () => {
    const lineItem = component.lineItems.at(0);
    lineItem.patchValue({ quantity: 2, price: 50 });
    expect(component.grandTotal).toBe(119);
  });

  it('should validate form', () => {
    // ✅ Fix: Use null or undefined for empty date, not empty string
    component.invoiceForm.patchValue({
      clientId: '',
      invoiceDate: null as any  // Use null instead of empty string
    });
    
    const errors = component.validateForm();
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should be valid when all fields are filled', () => {
    component.invoiceForm.patchValue({
      clientId: '1',
      invoiceDate: new Date()  
    });
    
    const lineItem = component.lineItems.at(0);
    lineItem.patchValue({
      description: 'Test Product',
      quantity: 1,
      price: 100
    });
    
    const errors = component.validateForm();
    expect(errors.length).toBe(0);
  });
});