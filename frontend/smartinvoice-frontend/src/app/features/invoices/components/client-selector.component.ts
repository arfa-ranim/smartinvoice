// features/invoices/components/client-selector/client-selector.component.ts
import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ClientService, Client } from '../../../core/services/client.service';
import { ClientQuickCreateDialog } from '../client-quick-create-dialog';

@Component({
  selector: 'app-client-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, TranslateModule],
  template: `
    <div class="form-field">
      <label for="clientSelect">{{ 'INVOICES.SELECT_CLIENT' | translate }} *</label>
      <input
        id="clientSelect"
        type="text"
        [formControl]="clientControl"
        [matAutocomplete]="clientAuto"
        class="form-input"
        [placeholder]="'INVOICES.SEARCH_CLIENT' | translate"
        aria-label="Select client"
      />
      <mat-autocomplete #clientAuto="matAutocomplete" [displayWith]="displayClient" (optionSelected)="onClientSelected($event)">
        @for (client of filteredClients | async; track client.id) {
          <mat-option [value]="client">{{ client.name }} ({{ client.company }})</mat-option>
        }
      </mat-autocomplete>
      <button type="button" class="quick-add-btn" (click)="quickCreateClient()">+ {{ 'INVOICES.NEW_CLIENT' | translate }}</button>
    </div>
  `,
  styles: [`
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .quick-add-btn { margin-top: 0.5rem; background: #10b981; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; width: fit-content; }
  `]
})
export class ClientSelectorComponent implements OnInit {
  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  clients: Client[] = [];
  filteredClients: Observable<Client[]> = of([]);
  clientControl = new FormControl('', Validators.required);

  @Output() clientSelected = new EventEmitter<string>();

  ngOnInit(): void {
    this.loadClients();
    this.setupAutocomplete();
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(clients => this.clients = clients);
  }

  setupAutocomplete(): void {
    this.filteredClients = this.clientControl.valueChanges.pipe(
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
    const client = event.option.value as Client;
    this.clientControl.setValue(client.name);
    this.clientSelected.emit(client.id);
  }

  quickCreateClient(): void {
    const dialogRef = this.dialog.open(ClientQuickCreateDialog, { width: '500px' });
    dialogRef.afterClosed().subscribe(newClient => {
      if (newClient) {
        this.loadClients();
        this.clientControl.setValue(newClient.name);
        this.clientSelected.emit(newClient.id);
        this.snackBar.open(this.translate.instant('INVOICES.CLIENT_CREATED_SELECTED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }
}