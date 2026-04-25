import { describe, it, expect, beforeEach } from 'vitest';
import { CurrencyPipe } from './currency.pipe';
import { CurrencyService } from '../../core/services/currency.service';

describe('CurrencyPipe', () => {
  let pipe: CurrencyPipe;
  let currencyService: CurrencyService;

  beforeEach(() => {
    currencyService = new CurrencyService();
    pipe = new CurrencyPipe();
    // Manually inject the service (or use TestBed)
    (pipe as any).currencyService = currencyService;
    currencyService.setCurrency('USD');
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format amount with default currency', () => {
    const result = pipe.transform(100);
    expect(result).toMatch(/\$ 100\.00/);
  });

  it('should format amount with specified currency code', () => {
    const result = pipe.transform(100, 'EUR');
    expect(result).toMatch(/€ 92\.00/);
  });
});