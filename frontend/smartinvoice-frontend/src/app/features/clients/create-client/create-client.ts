import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClientService, Client } from '../../../core/services/client.service';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { LayoutService } from '../../../core/services/layout.service';


@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    Sidebar,
    TopBar,
    TranslateModule
  ],
  templateUrl: './create-client.html',
  styleUrls: ['./create-client.scss']
})
export class CreateClient implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private clientService = inject(ClientService);
  private layoutService = inject(LayoutService);
  private translate = inject(TranslateService);

  isSaving = false;

  countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France'];
  filteredCountries = [...this.countries];
  countrySearch = '';


  clientForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    taxId: [''],
    vatNumber: ['', [Validators.pattern(/^[A-Z]{2}[A-Z0-9]{2,12}$/)]],
    companyName: ['', [Validators.required]],
    street: ['', [Validators.required]],
    city: ['', [Validators.required]],
    postalCode: [''],
    country: ['United States', [Validators.required]]
  });


  ngOnInit(): void {
    Object.keys(this.clientForm.controls).forEach(field => {
      this.clientForm.get(field)?.markAsTouched();
    });
  }

  // ✅ FIX: Safe translation fallback (NO template errors anymore)
  getPlaceholder(key: string, fallback: string): string {
    const value = this.translate.instant(key);
    return value && value.trim() ? value : fallback;
  }

  onCountrySearch(): void {
    this.filteredCountries = this.countries.filter(c =>
      c.toLowerCase().includes(this.countrySearch.toLowerCase())
    );
  }

  selectCountry(country: string): void {
    this.clientForm.patchValue({ country });
    this.countrySearch = '';
    this.filteredCountries = [...this.countries];
  }

  getInitialsPreview(): string {
  const name = this.clientForm.get('fullName')?.value;
  if (!name) return 'JD';
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}


  saveClient(): void {
    if (this.clientForm.invalid) {
      Object.keys(this.clientForm.controls).forEach(field => {
        this.clientForm.get(field)?.markAsTouched();
      });

      this.snackBar.open(
        this.translate.instant('CLIENTS.FIX_FORM_ERRORS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );

      return;
    }

    this.isSaving = true;

    const formValue = this.clientForm.value;

    const newClient: Client = {
      id: '',
      name: formValue.fullName ?? '',
      email: formValue.email ?? '',
      company: formValue.companyName ?? '',
      status: 'active',
      outstanding: 0,
      initials: this.getInitials(formValue.fullName ?? ''),
      color: '#0F4C81',

      phone: formValue.phone ?? undefined,
      taxId: formValue.taxId ?? undefined,
      vatNumber: formValue.vatNumber ?? undefined,
      street: formValue.street ?? undefined,
      city: formValue.city ?? undefined,
      postalCode: formValue.postalCode ?? undefined,
      country: formValue.country ?? undefined
    };

    this.clientService.addClient(newClient).subscribe({
      next: () => {
        this.isSaving = false;

        this.snackBar.open(
          this.translate.instant('CLIENTS.CREATE_SUCCESS'),
          this.translate.instant('COMMON.UNDO'),
          { duration: 5000 }
        );

        this.router.navigate(['/clients']);
      },

      error: () => {
        this.isSaving = false;

        this.snackBar.open(
          this.translate.instant('CLIENTS.CREATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }
   private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
}