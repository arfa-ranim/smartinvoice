import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule,
    Sidebar,
    BottomNav,
    TopBar,
    CurrencyPipe
  ],
  templateUrl: './edit-product.html',
  styleUrls: ['../create-product/create-product.scss']
})
export class EditProduct implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private layoutService = inject(LayoutService);
  private productService = inject(ProductService);

  productForm!: FormGroup;
  productType: 'physical' | 'service' = 'physical';
  taxRate = 15;
  unitOptions: string[] = ['piece', 'kg', 'meter', 'box', 'set'];
  isSubmitting = false;
  productId!: string;
  originalProduct!: Product;

  // Preview
  previewName = 'Edit Product';
  previewSku = '';
  previewSubtotal = 0;
  previewTax = 0;
  previewTotal = 0;

  ngOnInit(): void {
    this.initForm();
    this.setupValueChanges();

    this.route.params.subscribe(params => {
      this.productId = params['id'];
      this.loadProduct();
    });
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      type: ['physical', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: [''],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      taxRate: [15, Validators.required],
      unit: ['piece', Validators.required],
      initialStock: [0, [Validators.min(0)]],
      lowStockThreshold: [5],

      // ✅ FIXED
      alertEmailLowStock: [false]
    });

    this.updateValidators();
  }

  private setupValueChanges(): void {
    this.productForm.get('type')?.valueChanges.subscribe((type: 'physical' | 'service') => {
      this.productType = type;
      this.updateUnitOptions();
      this.updateValidators();

      if (type === 'service') {
        this.productForm.patchValue({
          sku: '',
          initialStock: 0,
          lowStockThreshold: null
        });
      }
    });

    this.productForm.get('name')?.valueChanges.subscribe(val => this.previewName = val || 'Edit Product');
    this.productForm.get('sku')?.valueChanges.subscribe(val => this.previewSku = val || 'SKU-XXX');
    this.productForm.get('price')?.valueChanges.subscribe(() => this.updatePreviewTotals());
    this.productForm.get('taxRate')?.valueChanges.subscribe(rate => {
      this.taxRate = rate;
      this.updatePreviewTotals();
    });
  }

  private updateUnitOptions(): void {
    this.unitOptions = this.productType === 'physical'
      ? ['piece', 'kg', 'meter', 'box', 'set']
      : ['hour', 'day', 'month', 'project', 'session'];

    this.productForm.patchValue({ unit: this.unitOptions[0] });
  }

  private updateValidators(): void {
    const skuControl = this.productForm.get('sku');

    if (this.productType === 'physical') {
      skuControl?.setValidators([Validators.required]);
    } else {
      skuControl?.clearValidators();
    }

    skuControl?.updateValueAndValidity();
  }

  private updatePreviewTotals(): void {
    const price = this.productForm.get('price')?.value || 0;
    const taxRate = this.productForm.get('taxRate')?.value || 0;

    this.previewSubtotal = price;
    this.previewTax = (price * taxRate) / 100;
    this.previewTotal = price + this.previewTax;
  }

  loadProduct(): void {
    this.productService.getProducts().subscribe(products => {
      const product = products.find(p => p.id === this.productId);

      if (product) {
        this.originalProduct = product;
        this.productType = product.type;
        this.taxRate = product.tax;
        this.populateForm();
      } else {
        this.snackBar.open('Product not found', 'Close', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }

  private populateForm(): void {
    this.productForm.patchValue({
      type: this.originalProduct.type,
      name: this.originalProduct.name,
      sku: this.originalProduct.sku,
      description: this.originalProduct.description || '',
      price: this.originalProduct.price,
      taxRate: this.originalProduct.tax,
      unit: this.originalProduct.type === 'physical' ? 'piece' : 'hour',
      initialStock: this.originalProduct.stock > -1 ? this.originalProduct.stock : 0,
      lowStockThreshold: this.originalProduct.lowStockThreshold || 5,

      // ✅ FIXED
      alertEmailLowStock: this.originalProduct.alertEmailLowStock || false
    });

    this.previewName = this.originalProduct.name;
    this.previewSku = this.originalProduct.sku;
    this.updatePreviewTotals();
  }

  isSkuUnique(): boolean {
    const sku = this.productForm.get('sku')?.value;
    if (!sku) return true;
    if (sku === this.originalProduct.sku) return true;
    return !this.productService.checkSkuExists(sku);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    const sku = this.productForm.get('sku')?.value;

    if (this.productType === 'physical' && !this.isSkuUnique()) {
      this.snackBar.open('SKU already exists. Please use a unique SKU.', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    const formValue = this.productForm.value;
    const initialStock = formValue.initialStock || 0;
    const threshold = formValue.lowStockThreshold || 5;

    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';

    if (initialStock <= 0) stockStatus = 'out_of_stock';
    else if (initialStock <= threshold) stockStatus = 'low_stock';

    const updatedProduct: Product = {
      ...this.originalProduct,
      name: formValue.name,
      sku: formValue.sku || 'SRV-' + Date.now(),
      description: formValue.description || '',
      type: formValue.type,
      price: formValue.price,
      tax: formValue.taxRate,
      taxLabel: formValue.taxRate === 0 ? 'Exempt' : (formValue.type === 'physical' ? 'VAT' : 'Tax'),
      stock: formValue.type === 'physical' ? initialStock : -1,
      stockStatus: stockStatus,
      isService: formValue.type === 'service',
      lowStockThreshold: threshold,

      // ✅ FIXED
      alertEmailLowStock: formValue.alertEmailLowStock || false
    };

    this.productService.updateProduct(updatedProduct);
    this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
    this.router.navigate(['/products']);
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  incrementStock(): void {
    const current = this.productForm.get('initialStock')?.value || 0;
    this.productForm.patchValue({ initialStock: current + 1 });
  }

  decrementStock(): void {
    const current = this.productForm.get('initialStock')?.value || 0;
    if (current > 0) {
      this.productForm.patchValue({ initialStock: current - 1 });
    }
  }

  getTipText(): string {
  return this.productType === 'physical'
    ? 'Physical stock tracking enables automated low-inventory alerts and periodic audit cycles.'
    : 'Consistent service pricing ensures predictable revenue streams and simplifies recurring billing.';
}

getTipIcon(): string {
  return this.productType === 'physical' ? 'info' : 'verified';
}

getBadgeLabel(): string {
  return this.productType === 'physical' ? 'Stockable Product' : 'Service';
}

getBadgeClass(): string {
  return this.productType === 'physical' ? 'badge-stockable' : 'badge-service';
}

}