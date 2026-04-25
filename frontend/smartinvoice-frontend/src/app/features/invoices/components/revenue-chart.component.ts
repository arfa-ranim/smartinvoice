import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { RevenueTrend } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatNativeDateModule, FormsModule],
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <div><h3>Revenue Growth Over Time</h3><p>Monthly breakdown of revenue</p></div>
        <div class="period-controls"><button (click)="toggleRange.emit()">{{ customRange ? 'Last 6 Months' : 'Custom Range' }}</button></div>
      </div>
      <div class="svg-container"><svg viewBox="0 0 800 300">...</svg></div>
    </div>
  `
})
export class RevenueChartComponent {
  @Input() revenueTrends: RevenueTrend[] = [];
  @Input() customRange = false;
  @Output() toggleRange = new EventEmitter<void>();
  @Output() dateRangeChange = new EventEmitter<{ start: Date; end: Date }>();
}