import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { BottomNav } from '../../../core/layout/bottom-nav/bottom-nav';
import { LayoutService } from '../../../core/services/layout.service';
import { TopBar } from '../../../core/layout/top-bar/top-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { InvoiceService, Invoice } from '../../../core/services/invoice.service';
import { AnalyticsService, RevenueTrend } from '../../../core/services/analytics.service';
import { ProductService, TopProduct } from '../../../core/services/product.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, Sidebar, BottomNav, TopBar, CurrencyPipe, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private invoiceService = inject(InvoiceService);
  private analyticsService = inject(AnalyticsService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchQuery = signal('');
  currentPage = 1;
  pageSize = 5;
  totalInvoices = 0;
  invoices: Invoice[] = [];
  isLoadingTable = false;
  selectedMonthFilter?: number;

  stats = { totalInvoices: 0, monthlyRevenue: 0, pendingPayments: 0 };
  revenueTrends: RevenueTrend[] = [];
  paymentStatus = { paid: 0, pending: 0, overdue: 0 };
  topProducts: TopProduct[] = [];

  @ViewChild('revenueChartCanvas') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  private revenueChart?: Chart;

  get paidPercentage(): number {
    const total = this.paymentStatus.paid + this.paymentStatus.pending + this.paymentStatus.overdue;
    return total ? Math.round((this.paymentStatus.paid / total) * 100) : 0;
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadRevenueTrends('6months');
    this.loadPaymentStatus();
    this.loadTopProducts();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadInvoices();
    });

    this.loadInvoices();
  }

  ngAfterViewInit(): void {
    this.initRevenueChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revenueChart?.destroy();
  }

  loadStats(): void {
    this.analyticsService.getStats().subscribe(s => this.stats = s);
  }

  loadRevenueTrends(period: '6months' | 'year'): void {
    this.analyticsService.getRevenueTrends(period).subscribe(data => {
      this.revenueTrends = data;
      this.updateRevenueChart();
    });
  }

  loadPaymentStatus(): void {
    this.analyticsService.getPaymentStatus().subscribe(s => this.paymentStatus = s);
  }

  loadTopProducts(): void {
    this.productService.getTopProducts(5).subscribe(p => {
      this.topProducts = p;
      this.cdr.detectChanges();
    });
  }

  loadInvoices(): void {
    this.isLoadingTable = true;
    this.invoiceService.getInvoices(this.currentPage, this.pageSize, this.searchQuery(), this.selectedMonthFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.invoices = res.data;
        this.totalInvoices = res.total;
        this.isLoadingTable = false;
        this.cdr.detectChanges();
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInvoices();
  }

  onGlobalSearch(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onPeriodChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.loadRevenueTrends(select.value as '6months' | 'year');
  }

  onChartMonthClick(monthIndex: number): void {
    this.selectedMonthFilter = monthIndex;
    this.currentPage = 1;
    this.loadInvoices();
  }

  previewInvoice(invoice: Invoice): void {
    this.invoiceService.previewInvoice(invoice.id).subscribe(url => {
      if (url) window.open(url, '_blank');
      else alert(this.translate.instant('DASHBOARD.PREVIEW_NOT_AVAILABLE'));
    });
  }

  downloadInvoice(invoice: Invoice): void {
    this.invoiceService.downloadInvoice(invoice.id).subscribe(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${invoice.id}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  viewInvoiceDetails(id: string): void {
    this.router.navigate(['/invoices', id]);
  }

  navigateToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  navigateToPayments(): void {
    this.router.navigate(['/payments']);
  }

  private initRevenueChart(): void {
    if (!this.revenueChartCanvas) return;
    this.revenueChart = new Chart(this.revenueChartCanvas.nativeElement, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: this.translate.instant('DASHBOARD.REVENUE_LABEL'), data: [], backgroundColor: '#0f4b80' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_, activeElements) => {
          if (activeElements.length) {
            this.onChartMonthClick(activeElements[0].index);
          }
        }
      }
    });
    this.updateRevenueChart();
  }

  private updateRevenueChart(): void {
    if (!this.revenueChart) return;
    this.revenueChart.data.labels = this.revenueTrends.map(t => t.month);
    this.revenueChart.data.datasets[0].data = this.revenueTrends.map(t => t.revenue);
    this.revenueChart.update();
  }

  ceil(value: number): number {
    return Math.ceil(value);
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  createInvoice(): void {
    this.router.navigate(['/invoices/create']);
  }

  viewAllInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'paid': return 'check_circle';
      case 'pending': return 'schedule';
      case 'overdue': return 'error';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}