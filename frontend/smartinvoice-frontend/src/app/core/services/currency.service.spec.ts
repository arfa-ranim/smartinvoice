import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrencies', () => {
    it('should return all available currencies', () => {
      const currencies = service.getCurrencies();
      expect(currencies.length).toBe(4);
      expect(currencies.map(c => c.code)).toContain('USD');
      expect(currencies.map(c => c.code)).toContain('EUR');
    });
  });

  describe('setCurrency', () => {
    it('should change the current currency', () => {
      service.setCurrency('EUR');
      let currentCurrency: any;
      service.currentCurrency$.subscribe(cc => currentCurrency = cc);
      expect(currentCurrency.code).toBe('EUR');
    });

    it('should save preferred currency to localStorage', () => {
      service.setCurrency('GBP');
      expect(localStorage.getItem('preferred_currency')).toBe('GBP');
    });
  });

  describe('formatAmount', () => {
    it('should format amount with current currency symbol', () => {
      service.setCurrency('USD');
      const formatted = service.formatAmount(100);
      expect(formatted).toMatch(/\$ 100\.00/);
    });
  });
});