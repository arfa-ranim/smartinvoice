import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClientService, Client } from '../../../core/services/client.service';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-edit-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    Sidebar,
    TopBar,
    TranslateModule
  ],
  templateUrl: './edit-client.html',
  styleUrls: ['../create-client/create-client.scss']
})
export class EditClient implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private clientService = inject(ClientService);
  private layoutService = inject(LayoutService);
  private translate = inject(TranslateService);

  isSaving = false;
  countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France'];
  filteredCountries = [...this.countries];
  countrySearch = '';
  clientId!: string;
  originalClient!: Client;

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
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      this.loadClient();
    });
  }

  loadClient(): void {
    this.clientService.getClients().subscribe(clients => {
      const client = clients.find(c => c.id === this.clientId);
      if (client) {
        this.originalClient = client;
        this.populateForm();
      } else {
        this.snackBar.open(this.translate.instant('CLIENTS.NOT_FOUND'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  private populateForm(): void {
    this.clientForm.patchValue({
      fullName: this.originalClient.name,
      email: this.originalClient.email,
      phone: this.originalClient.phone || '',
      taxId: this.originalClient.taxId || '',
      vatNumber: this.originalClient.vatNumber || '',
      companyName: this.originalClient.company,
      street: this.originalClient.street || '',
      city: this.originalClient.city || '',
      postalCode: this.originalClient.postalCode || '',
      country: this.originalClient.country || 'United States'
    });
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

  saveClient(): void {
    if (this.clientForm.invalid) {
      Object.keys(this.clientForm.controls).forEach(field => {
        const control = this.clientForm.get(field);
        control?.markAsTouched();
      });
      this.snackBar.open(this.translate.instant('CLIENTS.FIX_FORM_ERRORS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.clientForm.value;

    const updateData: Partial<Client> = {
      name: formValue.fullName ?? '',
      email: formValue.email ?? '',
      company: formValue.companyName ?? '',
      phone: formValue.phone ?? undefined,
      taxId: formValue.taxId ?? undefined,
      vatNumber: formValue.vatNumber ?? undefined,
      street: formValue.street ?? undefined,
      city: formValue.city ?? undefined,
      postalCode: formValue.postalCode ?? undefined,
      country: formValue.country ?? undefined,
      initials: this.getInitials(formValue.fullName ?? '')
    };

    this.clientService.updateClient(this.clientId, updateData).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open(this.translate.instant('CLIENTS.UPDATE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.router.navigate(['/clients']);
      },
      error: () => {
        this.isSaving = false;
        this.snackBar.open(this.translate.instant('CLIENTS.UPDATE_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
}