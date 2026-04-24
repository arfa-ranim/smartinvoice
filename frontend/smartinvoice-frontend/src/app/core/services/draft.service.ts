// core/services/draft.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LineItem } from './invoice.service';

export interface DraftInvoice {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  amount: number;
  dueDate: Date;
  notes: string;
  lineItems: LineItem[];
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class DraftService {
  private readonly STORAGE_KEY = 'smartinvoice_drafts';
  private drafts: DraftInvoice[] = [];

  constructor() {
    this.loadDrafts();
  }

  private loadDrafts(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.drafts = JSON.parse(stored).map((d: any) => ({
          ...d,
          dueDate: new Date(d.dueDate),
          createdAt: new Date(d.createdAt)
        }));
      } else {
        this.drafts = [];
      }
    } catch (error) {
      console.error('Failed to load drafts', error);
      this.drafts = [];
    }
  }

  private saveDrafts(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.drafts));
    } catch (error) {
      console.error('Failed to save drafts', error);
    }
  }

  getDrafts(): Observable<DraftInvoice[]> {
    return of([...this.drafts]).pipe(delay(100));
  }

  saveDraft(draft: Omit<DraftInvoice, 'id' | 'createdAt'>): Observable<DraftInvoice> {
    return new Observable<DraftInvoice>(observer => {
      try {
        const newDraft: DraftInvoice = {
          ...draft,
          id: 'DRAFT-' + Date.now(),
          createdAt: new Date()
        };
        this.drafts.push(newDraft);
        this.saveDrafts();
        observer.next(newDraft);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    }).pipe(delay(200));
  }

  updateDraft(id: string, draft: Partial<DraftInvoice>): Observable<DraftInvoice> {
    return new Observable<DraftInvoice>(observer => {
      const index = this.drafts.findIndex(d => d.id === id);
      if (index === -1) {
        observer.error(new Error('Draft not found'));
        return;
      }
      this.drafts[index] = { ...this.drafts[index], ...draft };
      this.saveDrafts();
      observer.next(this.drafts[index]);
      observer.complete();
    }).pipe(delay(200));
  }

  deleteDraft(id: string): Observable<void> {
    return new Observable<void>(observer => {
      const index = this.drafts.findIndex(d => d.id === id);
      if (index === -1) {
        observer.error(new Error('Draft not found'));
        return;
      }
      this.drafts = this.drafts.filter(d => d.id !== id);
      this.saveDrafts();
      observer.next();
      observer.complete();
    }).pipe(delay(200));
  }

  getDraftById(id: string): Observable<DraftInvoice | undefined> {
    return of(this.drafts.find(d => d.id === id)).pipe(delay(100));
  }

  clearAllDrafts(): Observable<void> {
    return new Observable<void>(observer => {
      this.drafts = [];
      this.saveDrafts();
      observer.next();
      observer.complete();
    }).pipe(delay(200));
  }

  confirmDelete(draftId: string, draftName: string): Observable<boolean> {
    return of(confirm(`Delete draft "${draftName}"? This cannot be undone.`));
  }
}