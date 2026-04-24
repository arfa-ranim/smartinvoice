import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClientService, Client } from '../../../core/services/client.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { InvoiceService, Invoice, LineItem } from '../../../core/services/invoice.service';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { LayoutService } from '../../../core/services/layout.service';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-edit-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, CurrencyPipe , MatButtonModule, MatSnackBarModule, MatDialogModule, MatAutocompleteModule, MatInputModule, Sidebar, TopBar, TranslateModule],
  templateUrl: './edit-invoice.html',
  styleUrls: ['./edit-invoice.scss']
})
export class EditInvoice implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private clientService = inject(ClientService);
  private invoiceService = inject(InvoiceService);
  private productService = inject(ProductService);
  private layoutService = inject(LayoutService);
  private translate = inject(TranslateService);

  clients: Client[] = [];
  filteredClients: Observable<Client[]> = of([]);
  products: Product[] = [];
  isSaving = false;
  invoiceId!: string;
  originalInvoice!: Invoice;
  productSuggestions: Product[][] = [];

  invoiceForm = this.fb.group({
    clientId: ['', Validators.required],
    invoiceDate: ['', Validators.required],
    notes: [''],
    lineItems: this.fb.array([])
  });

  get lineItems(): FormArray {
    return this.invoiceForm.get('lineItems') as FormArray;
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
    this.setupClientAutocomplete();

    this.route.params.subscribe(params => {
      this.invoiceId = params['id'];
      this.loadInvoice();
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(clients => this.clients = clients);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
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
      })
    );
  }

  displayClient(client: Client): string {
    return client ? `${client.name} (${client.company})` : '';
  }

  onClientSelected(event: any): void {
    const client = event.option.value;
    this.invoiceForm.patchValue({ clientId: client.id });
  }

  loadInvoice(): void {
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe(invoice => {
      if (invoice) {
        this.originalInvoice = invoice;
        this.populateForm();
      } else {
        this.snackBar.open(this.translate.instant('INVOICES.NOT_FOUND'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.router.navigate(['/invoices']);
      }
    });
  }

  private populateForm(): void {
    this.invoiceForm.patchValue({
      clientId: this.originalInvoice.clientId,
      invoiceDate: new Date(this.originalInvoice.dueDate).toISOString().split('T')[0],
      notes: this.originalInvoice.notes || ''
    });

    this.lineItems.clear();
    this.originalInvoice.lineItems?.forEach(item => {
      this.addLineItemFromExisting(item);
    });
    if (this.lineItems.length === 0) {
      this.addLineItem();
    }
  }

  addLineItemFromExisting(item?: LineItem): void {
    const lineForm = this.fb.group({
      description: [item?.description || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]],
      productId: [item?.productId || null]
    });
    this.lineItems.push(lineForm);
    this.productSuggestions.push([]);
    const index = this.lineItems.length - 1;
    lineForm.get('description')?.valueChanges.subscribe(value => {
      this.updateProductSuggestions(index, value || '');
    });
  }

  addLineItem(): void {
    this.addLineItemFromExisting();
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
    const group = this.lineItems.at(index) as FormGroup;
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
    if (confirm(this.translate.instant('INVOICES.REMOVE_LINE_CONFIRM'))) {
      this.lineItems.removeAt(index);
      this.productSuggestions.splice(index, 1);
    }
  }

  validateForm(): string[] {
    const errors: string[] = [];
    if (this.invoiceForm.invalid) {
      if (this.invoiceForm.get('clientId')?.invalid) errors.push(this.translate.instant('INVOICES.CLIENT_REQUIRED_ERROR'));
      if (this.invoiceForm.get('invoiceDate')?.invalid) errors.push(this.translate.instant('INVOICES.DATE_REQUIRED_ERROR'));
    }
    this.lineItems.controls.forEach((control, idx) => {
      if (!control.get('description')?.value) errors.push(this.translate.instant('INVOICES.LINE_MISSING_DESCRIPTION', { line: idx + 1 }));
      if ((control.get('quantity')?.value || 0) < 1) errors.push(this.translate.instant('INVOICES.LINE_INVALID_QUANTITY', { line: idx + 1 }));
      if ((control.get('price')?.value || 0) < 0) errors.push(this.translate.instant('INVOICES.LINE_INVALID_PRICE', { line: idx + 1 }));
    });
    return errors;
  }

  saveInvoice(): void {
    const errors = this.validateForm();
    if (errors.length) {
      this.snackBar.open(`${this.translate.instant('INVOICES.FIX_ERRORS')} ${errors.join(', ')}`, this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.invoiceForm.value;
    const selectedClient = this.clients.find(c => c.id === formValue.clientId);

    const lineItems: LineItem[] = this.lineItems.value.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      productId: item.productId || undefined
    }));

    const updatedInvoice: Invoice = {
      ...this.originalInvoice,
      clientId: formValue.clientId!,
      client: selectedClient?.name || '',
      clientInitials: selectedClient?.initials || '',
      amount: this.grandTotal,
      dueDate: new Date(formValue.invoiceDate!),
      notes: formValue.notes || '',
      lineItems: lineItems
    };

    this.invoiceService.updateInvoice(updatedInvoice).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open(this.translate.instant('INVOICES.UPDATE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.router.navigate(['/invoices']);
      },
      error: () => {
        this.isSaving = false;
        this.snackBar.open(this.translate.instant('INVOICES.UPDATE_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/invoices']);
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
}

