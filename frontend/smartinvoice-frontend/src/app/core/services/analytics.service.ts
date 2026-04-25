import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InvoiceService, Invoice } from './invoice.service';
import { ClientService, Client } from './client.service';

export interface RevenueTrend {
  month: string;
  revenue: number;
  year: number;
}

export interface ClientRevenue {
  clientId: string;
  clientName: string;
  clientInitials: string;
  revenue: number;
  invoiceCount: number;
  growth: number;
  status: 'active' | 'onHold';
  marketShare: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService
  ) {}

  getRevenueByMonth(startDate: Date, endDate: Date): Observable<RevenueTrend[]> {
    return new Observable(observer => {
      this.invoiceService.getAllInvoices().subscribe(invoices => {
        const filtered = invoices.filter(inv => {
          const invDate = new Date(inv.dueDate);
          return invDate >= startDate && invDate <= endDate;
        });
        // Group by month/year
        const groups = new Map<string, number>();
        filtered.forEach(inv => {
          const key = `${inv.dueDate.getFullYear()}-${inv.dueDate.getMonth()}`;
          groups.set(key, (groups.get(key) || 0) + inv.amount);
        });
        const sorted = Array.from(groups.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, revenue]) => {
            const [year, month] = key.split('-');
            const monthName = new Date(parseInt(year), parseInt(month)).toLocaleString('default', { month: 'short' });
            return { month: monthName, revenue, year: parseInt(year) };
          });
        observer.next(sorted);
        observer.complete();
      });
    });
  }

  getClientRevenues(): Observable<ClientRevenue[]> {
    return new Observable(observer => {
      Promise.all([
        this.invoiceService.getAllInvoices().toPromise(),
        this.clientService.getClients().toPromise()
      ]).then(([invoices, clients]) => {
        invoices = invoices ?? [];
        clients = clients ?? [];

        const clientMap = new Map<string, { revenue: number; count: number; name: string; initials: string }>();
        invoices.forEach(inv => {
          const existing = clientMap.get(inv.clientId);
          if (existing) {
            existing.revenue += inv.amount;
            existing.count++;
          } else {
            const client = clients.find(c => c.id === inv.clientId);
            clientMap.set(inv.clientId, {
              revenue: inv.amount,
              count: 1,
              name: client?.name || inv.client,
              initials: client?.initials || inv.clientInitials
            });
          }
        });
        const totalRevenue = Array.from(clientMap.values()).reduce((sum, c) => sum + c.revenue, 0);
        const clientRevenues: ClientRevenue[] = Array.from(clientMap.entries()).map(([id, data]) => ({
          clientId: id,
          clientName: data.name,
          clientInitials: data.initials,
          revenue: data.revenue,
          invoiceCount: data.count,
          growth: Math.random() * 30 - 10, // mock growth for demo
          status: Math.random() > 0.2 ? 'active' : 'onHold',
          marketShare: (data.revenue / totalRevenue) * 100
        }));
        observer.next(clientRevenues);
        observer.complete();
      });
    });
  }

  getRevenueByProduct(): Observable<{ name: string; revenue: number }[]> {
    // Mock product data – in real app, aggregate from invoice line items
    return of([
      { name: 'Pro Plan Subscription', revenue: 125000 },
      { name: 'Enterprise License', revenue: 98000 },
      { name: 'Consulting Hour', revenue: 72000 },
      { name: 'Support Package', revenue: 45000 },
      { name: 'Setup Fee', revenue: 28000 }
    ]);
  }

  getBillingCycles(): Observable<{ cycle: string; percentage: number }[]> {
    return of([
      { cycle: 'Monthly', percentage: 60 },
      { cycle: 'Quarterly', percentage: 25 },
      { cycle: 'Annual', percentage: 15 }
    ]);
  }

  getRetentionMetrics(): Observable<{ retentionRate: number; churnRate: number; avgLTV: number }> {
    return of({
      retentionRate: 94.2,
      churnRate: 5.8,
      avgLTV: 24500
    });
  }

  getStats(): Observable<{ totalInvoices: number; monthlyRevenue: number; pendingPayments: number }> {
  // Return mock stats (or compute from real data)
  return of({
    totalInvoices: 1284,
    monthlyRevenue: 45200,
    pendingPayments: 12
  });
}

  getRevenueTrends(period: '6months' | 'year'): Observable<RevenueTrend[]> {
    if (period === '6months') {
      return of([
        { month: 'Jan', revenue: 32500, year: new Date().getFullYear() },
        { month: 'Feb', revenue: 29800, year: new Date().getFullYear() },
        { month: 'Mar', revenue: 41000, year: new Date().getFullYear() },
        { month: 'Apr', revenue: 35600, year: new Date().getFullYear() },
        { month: 'May', revenue: 38900, year: new Date().getFullYear() },
        { month: 'Jun', revenue: 45200, year: new Date().getFullYear() }
      ]);
    } else {
      return of([
        { month: 'Jan', revenue: 32500, year: new Date().getFullYear() - 1 },
        { month: 'Feb', revenue: 29800, year: new Date().getFullYear() - 1 },
        { month: 'Mar', revenue: 41000, year: new Date().getFullYear() - 1 },
        { month: 'Apr', revenue: 35600, year: new Date().getFullYear() - 1 },
        { month: 'May', revenue: 38900, year: new Date().getFullYear() - 1 },
        { month: 'Jun', revenue: 45200, year: new Date().getFullYear() - 1 },
        { month: 'Jul', revenue: 47800, year: new Date().getFullYear() - 1 },
        { month: 'Aug', revenue: 49100, year: new Date().getFullYear() - 1 },
        { month: 'Sep', revenue: 52300, year: new Date().getFullYear() - 1 },
        { month: 'Oct', revenue: 50900, year: new Date().getFullYear() - 1 },
        { month: 'Nov', revenue: 54800, year: new Date().getFullYear() - 1 },
        { month: 'Dec', revenue: 58700, year: new Date().getFullYear() - 1 }
      ]);
    }
  }

  getPaymentStatus(): Observable<{ paid: number; pending: number; overdue: number }> {
    return of({
      paid: 721,
      pending: 148,
      overdue: 12
    });
  }

  forecastNextMonth(pastRevenues: RevenueTrend[]): { forecast: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
    if (pastRevenues.length < 3) return { forecast: 0, confidence: 0, trend: 'stable' };
    const values = pastRevenues.map(r => r.revenue);
    // Simple linear regression
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const next = slope * n + intercept;
    const last = values[values.length - 1];
    const trend = next > last ? 'up' : next < last ? 'down' : 'stable';
    const confidence = Math.min(85, Math.abs(slope) / (Math.max(...values) / n) * 50 + 30);
    return { forecast: Math.max(0, next), confidence, trend };
  }
}