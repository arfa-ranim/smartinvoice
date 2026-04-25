import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { ClientService, Client } from '../../../core/services/client.service';
import { MoreFiltersDialog, MoreFiltersData } from '../more-filters-dialog';
import { DeleteConfirmationDialog } from '../delete-confirmation-dialog';
import * as XLSX from 'xlsx';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTooltipModule, MatIconModule, 
    MatButtonModule, MatMenuModule, CurrencyPipe, MatDialogModule, 
    MatSnackBarModule, Sidebar, BottomNav, TopBar, TranslateModule
  ],
  templateUrl: './clients.html',
  styleUrls: ['./clients.scss']
})
export class Clients implements OnInit {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  // BehaviorSubjects for reactive filters
  private searchSubject = new BehaviorSubject<string>('');
  private filterSubject = new BehaviorSubject<'all' | 'active' | 'pending' | 'overdue'>('all');
  private moreFiltersSubject = new BehaviorSubject<MoreFiltersData>({ clientType: 'all', country: '' });
  private currentPageSubject = new BehaviorSubject<number>(1);
  private itemsPerPageSubject = new BehaviorSubject<number>(10);

  // Observable for filtered and paginated clients
  filteredClients$: Observable<Client[]>;
  totalClients$: Observable<number>;
  paginatedClients$: Observable<Client[]>;
  totalPages$: Observable<number>;
  startIndex$: Observable<number>;
  endIndex$: Observable<number>;
  pages$: Observable<number[]>;
  hasActiveFilters$: Observable<boolean>;

  pageSizeOptions = [10, 25, 50];

  constructor() {
    // Combine all filters
    const filters$ = combineLatest([
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()),
      this.filterSubject.pipe(distinctUntilChanged()),
      this.moreFiltersSubject.pipe(distinctUntilChanged())
    ]);

    // Apply filters to clients
    this.filteredClients$ = this.clientService.getClients().pipe(
      switchMap(clients => 
        filters$.pipe(
          map(([searchQuery, selectedFilter, moreFilters]) => {
            let result = [...clients];
            
            if (selectedFilter !== 'all') {
              result = result.filter(c => c.status === selectedFilter);
            }
            
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.company.toLowerCase().includes(q)
              );
            }
            
            if (moreFilters.country) {
              result = result.filter(c => c.country === moreFilters.country);
            }
            
            if (moreFilters.clientType === 'company') {
              result = result.filter(c => c.company && c.company.length > 0);
            } else if (moreFilters.clientType === 'individual') {
              result = result.filter(c => !c.company || c.company.length === 0);
            }
            
            return result;
          })
        )
      )
    );

    // Calculate totals and pagination
    this.totalClients$ = this.filteredClients$.pipe(map(clients => clients.length));
    
    this.paginatedClients$ = combineLatest([
      this.filteredClients$,
      this.currentPageSubject,
      this.itemsPerPageSubject
    ]).pipe(
      map(([clients, page, itemsPerPage]) => {
        const start = (page - 1) * itemsPerPage;
        return clients.slice(start, start + itemsPerPage);
      })
    );

    this.totalPages$ = combineLatest([this.totalClients$, this.itemsPerPageSubject])
      .pipe(map(([total, itemsPerPage]) => Math.ceil(total / itemsPerPage)));

    this.startIndex$ = combineLatest([this.currentPageSubject, this.itemsPerPageSubject])
      .pipe(map(([page, itemsPerPage]) => (page - 1) * itemsPerPage));

    this.endIndex$ = combineLatest([this.startIndex$, this.itemsPerPageSubject, this.totalClients$])
      .pipe(map(([start, itemsPerPage, total]) => Math.min(start + itemsPerPage, total)));

    this.pages$ = this.totalPages$.pipe(
      map(totalPages => {
        const pages: number[] = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
      })
    );

    this.hasActiveFilters$ = combineLatest([this.searchSubject, this.filterSubject, this.moreFiltersSubject])
      .pipe(map(([search, filter, more]) => 
        search.trim() !== '' || filter !== 'all' || !!more.country || more.clientType !== 'all'
      ));
  }

  ngOnInit(): void {
    this.clientService.getClients().subscribe(); // Initial load
  }

  // Filter setters
  setSearchQuery(query: string): void {
    this.searchSubject.next(query);
    this.currentPageSubject.next(1);
  }

  setFilter(filter: 'all' | 'active' | 'pending' | 'overdue'): void {
    this.filterSubject.next(filter);
    this.currentPageSubject.next(1);
  }

  setMoreFilters(filters: MoreFiltersData): void {
    this.moreFiltersSubject.next(filters);
    this.currentPageSubject.next(1);
  }

  clearFilters(): void {
    this.searchSubject.next('');
    this.filterSubject.next('all');
    this.moreFiltersSubject.next({ clientType: 'all', country: '' });
    this.currentPageSubject.next(1);
  }

  onSearch(): void {
    this.setSearchQuery(this.searchSubject.value);
  }

  onPageSizeChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.itemsPerPageSubject.next(value);
    this.currentPageSubject.next(1);
  }

  goToPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  previousPage(): void {
    const current = this.currentPageSubject.value;
    if (current > 1) this.currentPageSubject.next(current - 1);
  }

  nextPage(): void {
    const current = this.currentPageSubject.value;
    this.totalPages$.subscribe(total => {
      if (current < total) this.currentPageSubject.next(current + 1);
    }).unsubscribe();
  }

  addClient(): void {
    this.router.navigate(['/clients/create']);
  }

  openMoreFilters(): void {
    const dialogRef = this.dialog.open(MoreFiltersDialog, {
      width: '400px',
      data: this.moreFiltersSubject.value
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setMoreFilters(result);
      }
    });
  }

  editClient(client: Client): void {
    this.router.navigate(['/clients/edit', client.id]);
  }

deleteClient(client: Client): void {
  const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
    width: '400px',
    data: { clientName: client.name }
  });
  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      this.clientService.deleteClient(client.id).subscribe(() => {
        this.clientService.getClients().subscribe(); // Refresh
        this.snackBar.open(
          this.translate.instant('CLIENTS.DELETE_SUCCESS', { name: client.name }),
          this.translate.instant('COMMON.UNDO'),
          { duration: 5000 }
        );
      });
    }
  });
}

  viewInvoices(client: Client): void {
    this.router.navigate(['/invoices'], { queryParams: { clientId: client.id } });
  }

  exportToCSV(): void {
    this.filteredClients$.subscribe(clients => {
      const data = clients.map(c => ({
        [this.translate.instant('CLIENTS.EXPORT_NAME')]: c.name,
        [this.translate.instant('CLIENTS.EXPORT_EMAIL')]: c.email,
        [this.translate.instant('CLIENTS.EXPORT_COMPANY')]: c.company,
        [this.translate.instant('CLIENTS.EXPORT_STATUS')]: c.status,
        [this.translate.instant('CLIENTS.EXPORT_OUTSTANDING')]: c.outstanding,
        [this.translate.instant('CLIENTS.EXPORT_INVOICES')]: c.invoiceCount
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.translate.instant('CLIENTS.EXPORT_SHEET_NAME'));
      XLSX.writeFile(wb, `clients_${new Date().toISOString()}.xlsx`);
    });
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  // Getters for template binding to subjects (for two-way binding)
  get searchQuery(): string { return this.searchSubject.value; }
  set searchQuery(value: string) { this.setSearchQuery(value); }
  
  get selectedFilter(): 'all' | 'active' | 'pending' | 'overdue' { return this.filterSubject.value; }
  set selectedFilter(value: 'all' | 'active' | 'pending' | 'overdue') { this.setFilter(value); }
  
  get itemsPerPage(): number { return this.itemsPerPageSubject.value; }
  set itemsPerPage(value: number) { this.itemsPerPageSubject.next(value); }
  
  get currentPage(): number { return this.currentPageSubject.value; }
}