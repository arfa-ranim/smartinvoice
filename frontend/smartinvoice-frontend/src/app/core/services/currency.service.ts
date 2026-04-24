import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private currencies: Currency[] = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'EUR', symbol: '€', rate: 0.92 },
    { code: 'GBP', symbol: '£', rate: 0.79 },
    { code: 'TND', symbol: 'DT', rate: 3.12 }  
  ];

  private currentCurrencySubject = new BehaviorSubject<Currency>(this.currencies[0]);
  currentCurrency$ = this.currentCurrencySubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('preferred_currency');
    if (saved) {
      const found = this.currencies.find(c => c.code === saved);
      if (found) this.currentCurrencySubject.next(found);
    }
  }

  getCurrencies(): Currency[] {
    return this.currencies;
  }

  setCurrency(code: string): void {
    const currency = this.currencies.find(c => c.code === code);
    if (currency) {
      this.currentCurrencySubject.next(currency);
      localStorage.setItem('preferred_currency', code);
    }
  }

formatAmountWithCode(amount: number, targetCode: string): string {
  const target = this.currencies.find(c => c.code === targetCode);
  if (!target) return this.formatAmount(amount);
  const converted = amount * target.rate;
  return `${target.symbol} ${converted.toFixed(2)}`;
}
  formatAmount(amount: number): string {
    const currency = this.currentCurrencySubject.value;
    const converted = amount * currency.rate;
    return `${currency.symbol} ${converted.toFixed(2)}`;
  }
}