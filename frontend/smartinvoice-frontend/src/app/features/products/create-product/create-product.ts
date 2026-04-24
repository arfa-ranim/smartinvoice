import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { ProductService } from '../../../core/services/product.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule,
    Sidebar, BottomNav, TopBar, TranslateModule
  ],
  templateUrl: './create-product.html',
  styleUrls: ['./create-product.scss']
})
export class CreateProduct implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private layoutService = inject(LayoutService);
  private productService = inject(ProductService);
  private translate = inject(TranslateService);

  productForm!: FormGroup;
  productType: 'physical' | 'service' = 'physical';
  taxRate = 15;
  unitOptions: string[] = ['piece', 'kg', 'meter', 'box', 'set'];
  isSubmitting = false;

  previewName = 'New Product';
  previewSku = 'SKU-001';
  previewSubtotal = 0;
  previewTax = 0;
  previewTotal = 0;

  ngOnInit(): void {
    this.initForm();
    this.setupValueChanges();
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
        this.productForm.patchValue({ sku: '', initialStock: 0, lowStockThreshold: null });
      }
    });

    this.productForm.get('name')?.valueChanges.subscribe(val => this.previewName = val || this.translate.instant('PRODUCTS.NEW_PRODUCT'));
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

  isSkuUnique(): boolean {
    const sku = this.productForm.get('sku')?.value;
    if (!sku) return true;
    return !this.productService.checkSkuExists(sku);
  }

  onSubmit(andCreateAnother: boolean = false): void {
    if (this.productForm.invalid) {
      this.snackBar.open(this.translate.instant('PRODUCTS.FILL_REQUIRED_FIELDS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      return;
    }

    const sku = this.productForm.get('sku')?.value;
    if (this.productType === 'physical' && !this.isSkuUnique()) {
      this.snackBar.open(this.translate.instant('PRODUCTS.SKU_EXISTS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.productForm.value;
    const initialStock = formValue.initialStock || 0;
    const threshold = formValue.lowStockThreshold || 5;
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (initialStock <= 0) stockStatus = 'out_of_stock';
    else if (initialStock <= threshold) stockStatus = 'low_stock';
    else stockStatus = 'in_stock';

    const newProduct = {
      id: Date.now().toString(),
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
      alertEmailLowStock: formValue.alertEmailLowStock || false
    };

    this.productService.addProduct(newProduct);
    this.snackBar.open(this.translate.instant('PRODUCTS.CREATE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });

    if (andCreateAnother) {
      this.productForm.reset({
        type: 'physical',
        name: '',
        sku: '',
        description: '',
        price: 0,
        taxRate: 15,
        unit: 'piece',
        initialStock: 0,
        lowStockThreshold: 5,
        alertEmailLowStock: false
      });
      this.isSubmitting = false;
    } else {
      this.router.navigate(['/products']);
    }
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

  getTipText(): string {
    return this.productType === 'physical'
      ? this.translate.instant('PRODUCTS.TIP_PHYSICAL')
      : this.translate.instant('PRODUCTS.TIP_SERVICE');
  }

  getTipIcon(): string {
    return this.productType === 'physical' ? 'info' : 'verified';
  }

  getBadgeLabel(): string {
    return this.productType === 'physical'
      ? this.translate.instant('PRODUCTS.STOCKABLE_PRODUCT')
      : this.translate.instant('PRODUCTS.SERVICE');
  }

  getBadgeClass(): string {
    return this.productType === 'physical' ? 'badge-stockable' : 'badge-service';
  }

  incrementStock(): void {
    const current = this.productForm.get('initialStock')?.value || 0;
    this.productForm.patchValue({ initialStock: current + 1 });
  }

  decrementStock(): void {
    const current = this.productForm.get('initialStock')?.value || 0;
    if (current > 0) this.productForm.patchValue({ initialStock: current - 1 });
  }
}