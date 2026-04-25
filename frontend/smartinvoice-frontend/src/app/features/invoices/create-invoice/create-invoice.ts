import { Component, inject, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClientService, Client } from '../../../core/services/client.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/types/product.types';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { LayoutService } from '../../../core/services/layout.service';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ClientQuickCreateDialog } from '../client-quick-create-dialog';
import { InvoiceService, Invoice, LineItem } from '../../../core/services/invoice.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { DraftService, DraftInvoice } from '../../../core/services/draft.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDatepickerModule  } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Typed form value interfaces
interface InvoiceFormValue {
  clientId: string;
  invoiceDate: Date;
  notes: string;
  lineItems: LineItemFormValue[];
}

interface LineItemFormValue {
  description: string;
  quantity: number;
  price: number;
  productId: string | null;
}

type LineItemFormGroup = FormGroup<{
  description: FormControl<string>;
  quantity: FormControl<number>;
  price: FormControl<number>;
  productId: FormControl<string | null>;
}>;

type InvoiceFormGroup = FormGroup<{
  clientId: FormControl<string>;
  invoiceDate: FormControl<Date>; 
  notes: FormControl<string>;
  lineItems: FormArray<LineItemFormGroup>;
}>;

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule,
    MatSnackBarModule, MatDialogModule, MatAutocompleteModule, MatInputModule,
    Sidebar, TopBar, CurrencyPipe, TranslateModule , MatDatepickerModule,
MatNativeDateModule
  ],
  templateUrl: './create-invoice.html',
  styleUrls: ['./create-invoice.scss']
})
export class CreateInvoice implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private clientService = inject(ClientService);
  private invoiceService = inject(InvoiceService);
  private productService = inject(ProductService);
  private layoutService = inject(LayoutService);
  private translate = inject(TranslateService);
  private draftService = inject(DraftService);

  clients: Client[] = [];
  filteredClients: Observable<Client[]> = of([]);
  products: Product[] = [];
  newInvoiceNumber = '';
  isSaving = false;
  private cleanupInterval?: () => void;
  productSuggestions: Product[][] = [];

  // Typed form with nonNullable
invoiceForm: InvoiceFormGroup = this.fb.nonNullable.group({
  clientId: this.fb.nonNullable.control('', Validators.required),
invoiceDate: this.fb.nonNullable.control(new Date(), Validators.required),
  notes: this.fb.nonNullable.control(''),
  lineItems: this.fb.array<LineItemFormGroup>([])
});

get lineItems(): FormArray<LineItemFormGroup> {
  return this.invoiceForm.controls.lineItems;
}

  get subtotal(): number {
    return this.lineItems.controls.reduce((sum, control) => {
      const price = control.get('price')?.value || 0;
      const qty = control.get('quantity')?.value || 0;
      return sum + (price * qty);
    }, 0);
  }

  get vat(): number {
    return this.subtotal * 0.19;
  }

  get grandTotal(): number {
    return this.subtotal + this.vat;
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProducts();
    this.loadDraft();
    this.setupClientAutocomplete();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['duplicate']) {
        this.loadInvoiceForDuplicate(params['duplicate']);
      }
    });

    const interval = setInterval(() => this.saveDraft(), 30000);
    this.cleanupInterval = () => clearInterval(interval);
  }

  ngOnDestroy(): void {
    this.cleanupInterval?.();
    this.saveDraft();
  }

  loadClients(): void {
    this.clientService.getClients().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(clients => this.clients = clients);
  }

  loadProducts(): void {
    this.productService.getProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(products => {
      this.products = products;
      this.productSuggestions = new Array(this.lineItems.length).fill([]);
    });
  }

  setupClientAutocomplete(): void {
    this.filteredClients = this.invoiceForm.get('clientId')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const search = (value || '').toString().toLowerCase();
        return of(this.clients.filter(c =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.company.toLowerCase().includes(search)
        ));
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  displayClient(client: Client): string {
    return client ? `${client.name} (${client.company})` : '';
  }

  onClientSelected(event: any): void {
    const client = event.option.value as Client;
    this.invoiceForm.patchValue({ clientId: client.id });
  }

  quickCreateClient(): void {
    const dialogRef = this.dialog.open(ClientQuickCreateDialog, { width: '500px' });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(newClient => {
      if (newClient) {
        this.loadClients();
        this.invoiceForm.patchValue({ clientId: newClient.id });
        this.snackBar.open(this.translate.instant('INVOICES.CLIENT_CREATED_SELECTED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

addLineItem(product?: Product): void {
  const lineForm: LineItemFormGroup = this.fb.nonNullable.group({
    description: this.fb.nonNullable.control(product?.name || '', Validators.required),
    quantity: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    price: this.fb.nonNullable.control(product?.price || 0, [Validators.required, Validators.min(0)]),
    productId: this.fb.control(product?.id || null)
  });

  this.lineItems.push(lineForm);
  this.productSuggestions.push([]);

  const index = this.lineItems.length - 1;

  lineForm.controls.description.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(value => {
      this.updateProductSuggestions(index, value || '');
    });
}

  updateProductSuggestions(rowIndex: number, search: string): void {
    if (!search || search.length < 2) {
      this.productSuggestions[rowIndex] = [];
      return;
    }
    const term = search.toLowerCase();
    this.productSuggestions[rowIndex] = this.products.filter(p =>
      p.name.toLowerCase().includes(term)
    );
  }

  selectProductForLine(index: number, product: Product): void {
    const group = this.lineItems.at(index);
    group.patchValue({
      description: product.name,
      price: product.price,
      productId: product.id
    });
    this.productSuggestions[index] = [];
  }

removeLineItem(index: number): void {
  if (this.lineItems.length === 1) {
    this.snackBar.open(this.translate.instant('INVOICES.CANNOT_REMOVE_LAST'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
    return;
  }
  // Use MatDialog instead of confirm for better UX and testing
  const confirmRemove = confirm(this.translate.instant('INVOICES.REMOVE_LINE_CONFIRM'));
  if (confirmRemove) {
    this.lineItems.removeAt(index);
    this.productSuggestions.splice(index, 1);
    this.snackBar.open(this.translate.instant('INVOICES.LINE_REMOVED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
  }
}

  validateForm(): string[] {
    const errors: string[] = [];
    if (this.invoiceForm.invalid) {
      if (this.invoiceForm.get('clientId')?.invalid) errors.push(this.translate.instant('INVOICES.CLIENT_REQUIRED_ERROR'));
      if (this.invoiceForm.get('invoiceDate')?.invalid) errors.push(this.translate.instant('INVOICES.DATE_REQUIRED_ERROR'));
    }
    this.lineItems.controls.forEach((control, idx) => {
      const desc = control.get('description')?.value;
      const qty = control.get('quantity')?.value;
      const price = control.get('price')?.value;
      if (!desc) errors.push(this.translate.instant('INVOICES.LINE_MISSING_DESCRIPTION', { line: idx + 1 }));
      if (!qty || qty < 1) errors.push(this.translate.instant('INVOICES.LINE_INVALID_QUANTITY', { line: idx + 1 }));
      if (price === undefined || price === null || price < 0) errors.push(this.translate.instant('INVOICES.LINE_INVALID_PRICE', { line: idx + 1 }));
    });
    return errors;
  }

  saveDraft(): void {
    const formValue = this.invoiceForm.getRawValue();
    const selectedClient = this.clients.find(c => c.id === formValue.clientId);
    if (!selectedClient) return;
    const draft: Omit<DraftInvoice, 'id' | 'createdAt'> = {
      clientId: formValue.clientId,
      clientName: selectedClient.name,
      clientInitials: selectedClient.initials || '',
      amount: this.grandTotal,
      dueDate: new Date(formValue.invoiceDate),
      notes: formValue.notes,
      lineItems: this.lineItems.getRawValue().map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        productId: item.productId ?? undefined
      }))
    };
    this.draftService.saveDraft(draft).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.snackBar.open(this.translate.instant('INVOICES.DRAFT_SAVED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
  }

  loadDraft(): void {
    const raw = localStorage.getItem('invoice_draft');
    if (!raw) {
      this.addLineItem();
      this.newInvoiceNumber = this.generateInvoiceNumber();
      return;
    }
    const draft = JSON.parse(raw);
    if (draft.formValue) {
      // Ensure clientId is a string (fix object bug)
      const clientId = draft.formValue.clientId;
      this.invoiceForm.patchValue({
        clientId: typeof clientId === 'object' ? clientId.id : clientId,
        invoiceDate: new Date(draft.formValue.invoiceDate),
        notes: draft.formValue.notes
      });
      this.lineItems.clear();
      this.productSuggestions = [];
      
      if (draft.formValue.lineItems?.length) {
        draft.formValue.lineItems.forEach((item: any, idx: number) => {
          const lineForm: LineItemFormGroup = this.fb.nonNullable.group({
          description: this.fb.nonNullable.control(item.description, Validators.required),
          quantity: this.fb.nonNullable.control(item.quantity, [Validators.required, Validators.min(1)]),
          price: this.fb.nonNullable.control(item.price, [Validators.required, Validators.min(0)]),
          productId: this.fb.control(item.productId || null)
        });
          this.lineItems.push(lineForm);
          this.productSuggestions.push([]);
          
          lineForm.get('description')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
              this.updateProductSuggestions(idx, value || '');
            });
        });
      } else {
        this.addLineItem();
      }
      this.newInvoiceNumber = draft.newInvoiceNumber || this.generateInvoiceNumber();
      this.snackBar.open(this.translate.instant('INVOICES.DRAFT_RESTORED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      localStorage.removeItem('invoice_draft');
    } else {
      this.addLineItem();
      this.newInvoiceNumber = this.generateInvoiceNumber();
    }
  }

  loadInvoiceForDuplicate(id: string): void {
    this.invoiceService.getInvoiceById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(invoice => {
      if (invoice) {
        this.invoiceForm.patchValue({
          clientId: invoice.clientId,
          invoiceDate: new Date(),
          notes: invoice.notes || ''
        });
        this.lineItems.clear();
        this.productSuggestions = [];
        
        invoice.lineItems?.forEach((item, idx) => {
      const lineForm: LineItemFormGroup = this.fb.nonNullable.group({
        description: this.fb.nonNullable.control(item.description, Validators.required),
        quantity: this.fb.nonNullable.control(item.quantity, [Validators.required, Validators.min(1)]),
        price: this.fb.nonNullable.control(item.price, [Validators.required, Validators.min(0)]),
        productId: this.fb.control(item.productId || null)
      });
                this.lineItems.push(lineForm);
          this.productSuggestions.push([]);
          
          lineForm.get('description')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
              this.updateProductSuggestions(idx, value || '');
            });
        });
        this.newInvoiceNumber = this.generateInvoiceNumber();
        this.snackBar.open(this.translate.instant('INVOICES.DUPLICATED_EDIT'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

  generatePDF(): void {
    const errors = this.validateForm();
    if (errors.length) {
      this.snackBar.open(`${this.translate.instant('INVOICES.CANNOT_GENERATE_PDF')} ${errors.join(', ')}`, this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
      return;
    }
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.snackBar.open(this.translate.instant('INVOICES.PDF_GENERATED'), this.translate.instant('INVOICES.DOWNLOAD'), { duration: 5000 })
        .onAction().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(new Blob(['Fake PDF content'], { type: 'application/pdf' }));
          link.download = `invoice_${this.newInvoiceNumber}.pdf`;
          link.click();
          URL.revokeObjectURL(link.href);
        });
      setTimeout(() => {
        this.snackBar.open(this.translate.instant('INVOICES.EMAIL_INVOICE_ASK'), this.translate.instant('INVOICES.EMAIL'), { duration: 5000 })
          .onAction().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.snackBar.open(this.translate.instant('INVOICES.EMAIL_SENT_SIMULATED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
          });
      }, 1000);
    }, 1500);
  }

saveInvoice(): void {
  const errors = this.validateForm();
if (this.lineItems.length === 0) {
  this.snackBar.open('Please add at least one line item', 'Close', { duration: 3000 });
  return;
  }
    this.isSaving = true;
    const formValue = this.invoiceForm.getRawValue();
    const selectedClient = this.clients.find(c => c.id === formValue.clientId);
    if (!selectedClient) {
      this.snackBar.open(this.translate.instant('INVOICES.CLIENT_NOT_FOUND'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      this.isSaving = false;
      return;
    }
    const lineItems: LineItem[] = this.lineItems.getRawValue().map((item: LineItemFormValue) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      productId: item.productId || undefined
    }));
    const newInvoice: Invoice = {
      id: this.newInvoiceNumber,
      clientId: formValue.clientId,
      client: selectedClient.name,
      clientInitials: selectedClient.initials || '',
      amount: this.grandTotal,
      status: 'pending',
      dueDate: new Date(formValue.invoiceDate),
      notes: formValue.notes,
      lineItems: lineItems,
      invoiceType: 'sales'
    };
    this.invoiceService.createInvoice(newInvoice).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving = false;
        localStorage.removeItem('invoice_draft');
        this.snackBar.open(this.translate.instant('INVOICES.CREATED_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.router.navigate(['/invoices']);
      },
      error: () => {
        this.isSaving = false;
        this.snackBar.open(this.translate.instant('INVOICES.CREATE_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}-${random}`;
  }

  saveAsDraft(): void {
    this.saveDraft();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }
  // Add this method to create-invoice.ts for debugging
checkFunctionality(): void {
  console.log('✅ Client Selection:', !!this.clients.length);
  console.log('✅ Line Items:', this.lineItems.length);
  console.log('✅ Subtotal:', this.subtotal);
  console.log('✅ VAT:', this.vat);
  console.log('✅ Grand Total:', this.grandTotal);
  console.log('✅ Draft Save:', typeof this.saveDraft === 'function');
  console.log('✅ Invoice Save:', typeof this.saveInvoice === 'function');
}
}