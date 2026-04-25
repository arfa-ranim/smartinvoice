import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService, RevenueTrend } from './analytics.service';
import { InvoiceService } from './invoice.service';
import { ClientService } from './client.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let invoiceService: InvoiceService;
  let clientService: ClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsService);
    invoiceService = TestBed.inject(InvoiceService);
    clientService = TestBed.inject(ClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRevenueTrends', () => {
    it('should return 6 months of data for 6months period', async () => {
      const trends = await service.getRevenueTrends('6months').toPromise();
      expect(trends?.length).toBe(6);
      expect(trends?.[0]).toHaveProperty('month');
      expect(trends?.[0]).toHaveProperty('revenue');
    });

    it('should return 12 months of data for year period', async () => {
      const trends = await service.getRevenueTrends('year').toPromise();
      expect(trends?.length).toBe(12);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status counts', async () => {
      const status = await service.getPaymentStatus().toPromise();
      expect(status).toHaveProperty('paid');
      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('overdue');
      expect(typeof status?.paid).toBe('number');
    });
  });

  describe('forecastNextMonth', () => {
    it('should forecast next month revenue', () => {
      const pastRevenues: RevenueTrend[] = [
        { month: 'Jan', revenue: 10000, year: 2024 },
        { month: 'Feb', revenue: 11000, year: 2024 },
        { month: 'Mar', revenue: 12000, year: 2024 }
      ];
      
      const forecast = service.forecastNextMonth(pastRevenues);
      
      expect(forecast).toHaveProperty('forecast');
      expect(forecast).toHaveProperty('confidence');
      expect(forecast).toHaveProperty('trend');
      expect(['up', 'down', 'stable']).toContain(forecast.trend);
      expect(forecast.forecast).toBeGreaterThan(0);
      expect(forecast.confidence).toBeLessThanOrEqual(85);
    });

    it('should return stable trend for insufficient data', () => {
      const pastRevenues: RevenueTrend[] = [
        { month: 'Jan', revenue: 10000, year: 2024 }
      ];
      
      const forecast = service.forecastNextMonth(pastRevenues);
      
      expect(forecast.trend).toBe('stable');
      expect(forecast.forecast).toBe(0);
      expect(forecast.confidence).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return dashboard stats', async () => {
      const stats = await service.getStats().toPromise();
      expect(stats).toHaveProperty('totalInvoices');
      expect(stats).toHaveProperty('monthlyRevenue');
      expect(stats).toHaveProperty('pendingPayments');
    });
  });
});