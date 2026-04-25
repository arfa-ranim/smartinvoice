import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { InvoiceService, Invoice } from '../../../core/services/invoice.service';
import { ClientService, Client } from '../../../core/services/client.service';
import { EmailService } from '../../../core/services/email.service';
import { DraftService, DraftInvoice } from '../../../core/services/draft.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { InvoicePreviewModal } from '../invoice-preview-modal';
import { InvoiceFiltersComponent } from '../components/invoice-filters.component';
import { InvoiceTableComponent } from '../components/invoice-table.component';
import { DraftsPanelComponent } from '../components/drafts-panel.component';
import { MatIconModule } from '@angular/material/icon';            
import { MatTooltipModule } from '@angular/material/tooltip';  
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    Sidebar,
    BottomNav,
    TopBar,
    CurrencyPipe,
    TranslateModule,
    MatIconModule,           
    MatTooltipModule,
    MatMenuModule,
    InvoiceFiltersComponent,
    InvoiceTableComponent,  
    DraftsPanelComponent
  ],
  templateUrl: './invoice-list.html',
  styleUrls: ['./invoice-list.scss']
})
export class InvoiceList implements OnInit, AfterViewInit {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private emailService = inject(EmailService);
  private cdr = inject(ChangeDetectorRef);
  private draftService = inject(DraftService);
  private translate = inject(TranslateService);

  // Data
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  clients: Client[] = [];
  drafts: DraftInvoice[] = [];

  // Filters state
  searchQuery = '';
  selectedFilter: 'all' | 'paid' | 'pending' | 'overdue' = 'all';
  selectedInvoiceType: 'all' | 'sales' | 'purchase' = 'all';
  dateFrom = '';
  dateTo = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  selectedClientId = '';

  // Sorting & Pagination
  sortColumn: 'id' | 'clientName' | 'amount' | 'date' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 25, 50];

  // Stats (used in template)
  get totalInvoices(): number { return this.filteredInvoices.length; }
  get totalPages(): number { return Math.ceil(this.totalInvoices / this.itemsPerPage); }
  get startIndex(): number { return (this.currentPage - 1) * this.itemsPerPage; }
  get endIndex(): number { return Math.min(this.startIndex + this.itemsPerPage, this.totalInvoices); }
  get paginatedInvoices(): Invoice[] { return this.filteredInvoices.slice(this.startIndex, this.startIndex + this.itemsPerPage); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get totalRevenue(): number { return this.invoices.reduce((sum, inv) => sum + inv.amount, 0); }
  get totalOutstanding(): number { return this.invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0); }
  get paidCount(): number { return this.invoices.filter(inv => inv.status === 'paid').length; }
  get pendingCount(): number { return this.invoices.filter(inv => inv.status === 'pending').length; }
  get overdueCount(): number { return this.invoices.filter(inv => inv.status === 'overdue').length; }

  // Filter counts for badges
  get filterCounts() {
    return {
      all: this.invoices.length,
      paid: this.invoices.filter(i => i.status === 'paid').length,
      pending: this.invoices.filter(i => i.status === 'pending').length,
      overdue: this.invoices.filter(i => i.status === 'overdue').length
    };
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  loadData(): void {
    this.loadInvoices();
    this.loadClients();
    this.loadDrafts();
  }

  loadInvoices(): void {
    this.invoiceService.getAllInvoices().pipe(delay(0)).subscribe(invoices => {
      this.invoices = invoices;
      this.applyFilters();
      this.currentPage = 1;
      this.cdr.detectChanges();
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
      this.cdr.detectChanges();
    });
  }

  loadDrafts(): void {
    this.draftService.getDrafts().subscribe(drafts => {
      this.drafts = drafts;
      this.cdr.detectChanges();
    });
  }

  applyFilters(): void {
    let result = [...this.invoices];

    // Invoice type filter
    if (this.selectedInvoiceType !== 'all') {
      result = result.filter(inv => inv.invoiceType === this.selectedInvoiceType);
    }

    // Status filter
    if (this.selectedFilter !== 'all') {
      result = result.filter(inv => inv.status === this.selectedFilter);
    }

    // Search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(inv =>
        inv.id.toLowerCase().includes(q) ||
        inv.client.toLowerCase().includes(q)
      );
    }

    // Date range
    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      result = result.filter(inv => new Date(inv.dueDate) >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59);
      result = result.filter(inv => new Date(inv.dueDate) <= to);
    }

    // Amount range
    if (this.minAmount !== null) {
      result = result.filter(inv => inv.amount >= this.minAmount!);
    }
    if (this.maxAmount !== null) {
      result = result.filter(inv => inv.amount <= this.maxAmount!);
    }

    // Client filter
    if (this.selectedClientId) {
      result = result.filter(inv => inv.clientId === this.selectedClientId);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any, valB: any;
      switch (this.sortColumn) {
        case 'id': valA = a.id; valB = b.id; break;
        case 'clientName': valA = a.client; valB = b.client; break;
        case 'amount': valA = a.amount; valB = b.amount; break;
        case 'date': valA = new Date(a.dueDate).getTime(); valB = new Date(b.dueDate).getTime(); break;
        default: return 0;
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredInvoices = result;
    this.cdr.detectChanges();
  }

  // Event handlers
  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter as any;
    this.applyFilters();
  }

  onInvoiceTypeChange(type: string): void {
    this.selectedInvoiceType = type as any;
    this.applyFilters();
  }

  onDateFromChange(date: string): void {
    this.dateFrom = date;
    this.applyFilters();
  }

  onDateToChange(date: string): void {
    this.dateTo = date;
    this.applyFilters();
  }

  onMinAmountChange(amount: number): void {
    this.minAmount = amount;
    this.applyFilters();
  }

  onMaxAmountChange(amount: number): void {
    this.maxAmount = amount;
    this.applyFilters();
  }

  onClientChange(clientId: string): void {
    this.selectedClientId = clientId;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedFilter = 'all';
    this.selectedInvoiceType = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.selectedClientId = '';
    this.applyFilters();
    this.snackBar.open(this.translate.instant('INVOICES.FILTERS_CLEARED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
  }

  onSort(column: 'id' | 'clientName' | 'amount' | 'date'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  onRowClick(invoice: Invoice): void {
    this.openInvoicePreview(invoice);
  }

  onStatusChange(event: { invoice: Invoice; status: string }): void {
    this.invoiceService.updateInvoiceStatus(event.invoice.id, event.status as any).subscribe(() => {
      this.loadInvoices();
      this.snackBar.open(this.translate.instant('INVOICES.STATUS_CHANGED', { status: event.status }), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
    });
  }

  onEdit(invoice: Invoice): void {
    this.router.navigate(['/invoices/edit', invoice.id]);
  }

  onMarkPaid(invoice: Invoice): void {
    this.invoiceService.updateInvoiceStatus(invoice.id, 'paid').subscribe(() => {
      this.loadInvoices();
      this.snackBar.open(this.translate.instant('INVOICES.MARKED_PAID', { id: invoice.id }), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    });
  }

  onSendReminder(invoice: Invoice): void {
    this.emailService.sendPaymentReminder(invoice.client, invoice.id, invoice.amount).subscribe(() => {
      this.snackBar.open(this.translate.instant('INVOICES.REMINDER_SENT', { client: invoice.client }), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    });
  }

  onDuplicate(invoice: Invoice): void {
    this.router.navigate(['/invoices/create'], { queryParams: { duplicate: invoice.id } });
  }

  onResumeDraft(draft: DraftInvoice): void {
    const draftData = {
      formValue: {
        clientId: draft.clientId,
        invoiceDate: draft.dueDate.toISOString().split('T')[0],
        notes: draft.notes,
        lineItems: draft.lineItems
      },
      newInvoiceNumber: ''
    };
    localStorage.setItem('invoice_draft', JSON.stringify(draftData));
    this.router.navigate(['/invoices/create']);
  }

  onDeleteDraft(id: string): void {
    if (confirm(this.translate.instant('INVOICES.DELETE_DRAFT_CONFIRM'))) {
      this.draftService.deleteDraft(id).subscribe(() => {
        this.loadDrafts();
        this.snackBar.open(this.translate.instant('INVOICES.DRAFT_DELETED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
      });
    }
  }

  onClearAllDrafts(): void {
    if (confirm(this.translate.instant('INVOICES.CLEAR_ALL_DRAFTS_CONFIRM'))) {
      this.drafts.forEach(d => this.draftService.deleteDraft(d.id).subscribe());
      setTimeout(() => {
        this.loadDrafts();
      }, 500);
      this.snackBar.open(this.translate.instant('INVOICES.ALL_DRAFTS_DELETED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
    }
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onPageSizeChange(event: Event): void {
    this.itemsPerPage = parseInt((event.target as HTMLSelectElement).value, 10);
    this.currentPage = 1;
    this.applyFilters();
  }

  // Actions
  createInvoice(): void {
    this.router.navigate(['/invoices/create']);
  }

  openInvoicePreview(invoice: Invoice): void {
    const dialogRef = this.dialog.open(InvoicePreviewModal, {
      width: '900px',
      maxWidth: '90vw',
      data: invoice
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'markPaid') {
        this.invoiceService.updateInvoiceStatus(invoice.id, 'paid').subscribe(() => this.loadInvoices());
      }
    });
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  isOverdue(invoice: Invoice): boolean {
    return invoice.status === 'overdue';
  }

  // Real Excel Export functionality
  exportToExcel(): void {
    try {
      // Prepare data for Excel
      const exportData = this.filteredInvoices.map(inv => ({
        'Invoice ID': inv.id,
        'Client Name': inv.client,
        'Client Initials': inv.clientInitials,
        'Amount': inv.amount,
        'Status': inv.status.toUpperCase(),
        'Due Date': new Date(inv.dueDate).toLocaleDateString(),
        'Type': inv.invoiceType === 'sales' ? 'Sales (Client owes me)' : 'Purchase (I owe)',
        'Notes': inv.notes || ''
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Invoice ID
        { wch: 25 }, // Client Name
        { wch: 15 }, // Client Initials
        { wch: 12 }, // Amount
        { wch: 10 }, // Status
        { wch: 12 }, // Due Date
        { wch: 30 }, // Type
        { wch: 40 }  // Notes
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const fileName = `invoices_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
      
      this.snackBar.open(this.translate.instant('INVOICES.EXPORT_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    } catch (error) {
      console.error('Export error:', error);
      this.snackBar.open(this.translate.instant('INVOICES.EXPORT_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    }
  }
}