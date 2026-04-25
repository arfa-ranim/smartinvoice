// core/layout/sidebar/sidebar.ts
import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutService } from '../../../core/services/layout.service';
import { InvoiceService } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  
  isOpen = false;
  pendingInvoicesCount = 0;

  
  private effectRef = effect(() => {
    this.isOpen = this.layoutService.isSidebarOpen();
  });

  ngOnInit(): void {
    this.loadPendingCount();
  }

  ngOnDestroy(): void {
    this.effectRef?.destroy();
  }

  loadPendingCount(): void {
    this.invoiceService.getAllInvoices().subscribe(invoices => {
      this.pendingInvoicesCount = invoices.filter(inv => inv.status === 'pending').length;
    });
  }

  closeSidebar(): void {
    this.layoutService.closeSidebar();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.closeSidebar();
  }
}