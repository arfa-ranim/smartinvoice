import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Chart, registerables } from 'chart.js';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { AnalyticsService, RevenueTrend, ClientRevenue } from '../../../core/services/analytics.service';
import * as XLSX from 'xlsx';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyService } from '../../../core/services/currency.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatIconModule, MatTooltipModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPipe,
    Sidebar, BottomNav, TopBar
  ],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss']
})
export class Analytics implements OnInit, OnDestroy, AfterViewInit {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private analyticsService = inject(AnalyticsService);
  private currencyService = inject(CurrencyService);

  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  private revenueChart?: Chart;

  selectedTab: 'exec' | 'revenue' | 'billing' | 'retention' | 'forecast' = 'exec';
  dateRangeStart = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
  dateRangeEnd = new Date();
  customRangeMode = false;

  revenueTrends: RevenueTrend[] = [];
  clientRevenues: ClientRevenue[] = [];
  allClientRevenues: ClientRevenue[] = [];
  productRevenues: { name: string; revenue: number }[] = [];
  billingCycles: { cycle: string; percentage: number }[] = [];
  retentionMetrics = { retentionRate: 0, churnRate: 0, avgLTV: 0 };
  forecast: { forecast: number; confidence: number; trend: 'up' | 'down' | 'stable' } = { forecast: 0, confidence: 0, trend: 'stable' };

  sortColumn: keyof ClientRevenue = 'revenue';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  itemsPerPage: number = 5; 
  pageSizeOptions = [5, 10, 25];

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initRevenueChart();
  }

  ngOnDestroy(): void {
    this.revenueChart?.destroy();
  }

  loadData(): void {
    this.analyticsService.getRevenueByMonth(this.dateRangeStart, this.dateRangeEnd).subscribe(data => {
      this.revenueTrends = data;
      this.updateRevenueChart();
      this.calculateForecast();
    });
    this.analyticsService.getClientRevenues().subscribe(data => {
      this.allClientRevenues = data;
      this.applySort();
      this.currentPage = 1;
    });
    this.analyticsService.getRevenueByProduct().subscribe(data => this.productRevenues = data);
    this.analyticsService.getBillingCycles().subscribe(data => this.billingCycles = data);
    this.analyticsService.getRetentionMetrics().subscribe(data => this.retentionMetrics = data);
  }

  private initRevenueChart(): void {
    if (!this.revenueChartCanvas) return;
    
    this.revenueChart = new Chart(this.revenueChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Revenue',
          data: [],
          borderColor: '#0f4b80',
          backgroundColor: 'rgba(15, 75, 128, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0f4b80',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `Revenue: ${this.currencyService.formatAmount(value)}`;
              }
            }
          },
          legend: {
            position: 'top'
          }
        },
        onClick: (_, activeElements) => {
          if (activeElements.length) {
            this.onChartMonthClick(activeElements[0]?.index);
          }
        }
      }
    });
  }

  private updateRevenueChart(): void {
    if (!this.revenueChart) return;
    
    this.revenueChart.data.labels = this.revenueTrends.map(t => t.month);
    this.revenueChart.data.datasets[0].data = this.revenueTrends.map(t => t.revenue);
    this.revenueChart.update();
  }

  calculateForecast(): void {
    if (this.revenueTrends.length >= 3) {
      this.forecast = this.analyticsService.forecastNextMonth(this.revenueTrends);
    }
  }

  onDateRangeChange(): void {
    this.loadData();
  }

  toggleCustomRange(): void {
    this.customRangeMode = !this.customRangeMode;
    if (!this.customRangeMode) {
      this.dateRangeStart = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
      this.dateRangeEnd = new Date();
      this.loadData();
    }
  }

onChartMonthClick(monthIndex: number | null | undefined): void {
  if (monthIndex === null || monthIndex === undefined) return;

  const month = this.revenueTrends[monthIndex]?.month;
  if (!month) return;

  this.snackBar.open(`Selected month: ${month}`, 'Close', { duration: 2000 });
}

  setSort(column: keyof ClientRevenue): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    this.applySort();
  }

  applySort(): void {
    this.clientRevenues = [...this.allClientRevenues].sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedClients(): ClientRevenue[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.clientRevenues.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.clientRevenues.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.clientRevenues.length);
  }

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
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);
    this.currentPage = 1;
  }

  exportToExcel(): void {
    const exportData = this.clientRevenues.map(c => ({
      'Client Name': c.clientName,
      'Revenue': c.revenue,
      'Invoices': c.invoiceCount,
      'Growth (%)': c.growth.toFixed(1),
      'Market Share (%)': c.marketShare.toFixed(1),
      'Status': c.status
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top Clients');
    XLSX.writeFile(wb, `analytics_clients_${new Date().toISOString()}.xlsx`);
    this.snackBar.open('Exported to Excel', 'Close', { duration: 2000 });
  }

  viewClientInvoices(clientId: string): void {
    this.router.navigate(['/invoices'], { queryParams: { clientId } });
  }

  setTab(tab: 'exec' | 'revenue' | 'billing' | 'retention' | 'forecast'): void {
    this.selectedTab = tab;
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
}