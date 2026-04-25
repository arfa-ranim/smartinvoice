import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: true
})
export class CurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number, currencyCode?: string): string {
    if (currencyCode) {
      return this.currencyService.formatAmountWithCode(value, currencyCode);
    }
    return this.currencyService.formatAmount(value);
  }
}