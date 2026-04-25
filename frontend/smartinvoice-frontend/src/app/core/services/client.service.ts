// core/services/client.service.ts

import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'pending' | 'overdue';
  outstanding: number;
  initials: string;
  color: string;
  phone?: string;
  taxId?: string;
  vatNumber?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  invoiceCount?: number;
}

// Mock data for initial load
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    company: 'Lumina Studio',
    status: 'active',
    outstanding: 1250.00,
    initials: 'JD',
    color: '#0F4C81',
    phone: '+1 (555) 123-4567',
    taxId: 'US-123456',
    vatNumber: 'EU123456789',
    street: '123 Business Way',
    city: 'New York',
    postalCode: '10001',
    country: 'United States',
    invoiceCount: 5
  },
  {
    id: '2',
    name: 'Robert King',
    email: 'robert@kingagency.co',
    company: 'King Creative Agency',
    status: 'pending',
    outstanding: 0.00,
    initials: 'RK',
    color: '#FFC107',
    phone: '+44 20 7946 0123',
    country: 'United Kingdom',
    invoiceCount: 2
  },
  {
    id: '3',
    name: 'Alice Smith',
    email: 'alice@smithtech.io',
    company: 'Smith Tech Solutions',
    status: 'overdue',
    outstanding: 3420.50,
    initials: 'AS',
    color: '#EF4444',
    phone: '+1 (555) 987-6543',
    country: 'Canada',
    invoiceCount: 7
  },
  {
    id: '4',
    name: 'Marcus Wright',
    email: 'm.wright@global.com',
    company: 'Global Logistics Corp',
    status: 'active',
    outstanding: 8100.00,
    initials: 'MW',
    color: '#0F4C81',
    phone: '+49 30 1234567',
    country: 'Germany',
    invoiceCount: 12
  },
  {
    id: '5',
    name: 'Emily Clark',
    email: 'emily@clark.co',
    company: 'Clark Digital',
    status: 'pending',
    outstanding: 450.00,
    initials: 'EC',
    color: '#0F4C81',
    invoiceCount: 1
  },
  {
    id: '6',
    name: 'Michael Brown',
    email: 'michael@brown.com',
    company: 'Brown Innovations',
    status: 'active',
    outstanding: 2300.00,
    initials: 'MB',
    color: '#0F4C81',
    invoiceCount: 4
  },
  {
    id: '7',
    name: 'Sarah Johnson',
    email: 'sarah@johnson.io',
    company: 'Johnson Media',
    status: 'overdue',
    outstanding: 5670.00,
    initials: 'SJ',
    color: '#EF4444',
    invoiceCount: 3
  },
  {
    id: '8',
    name: 'David Lee',
    email: 'david@lee.com',
    company: 'Lee Consulting',
    status: 'active',
    outstanding: 890.00,
    initials: 'DL',
    color: '#0F4C81',
    invoiceCount: 6
  }
];

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly STORAGE_KEY = 'smartinvoice_clients';
  private clients = signal<Client[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  // --------------------------------------------------------------------------
  // Storage Methods
  // --------------------------------------------------------------------------
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const clients = JSON.parse(stored);
        this.clients.set(clients);
      } else {
        this.clients.set([...MOCK_CLIENTS]);
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to load clients from storage:', error);
      this.clients.set([...MOCK_CLIENTS]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.clients()));
    } catch (error) {
      console.error('Failed to save clients to storage:', error);
    }
  }

  // --------------------------------------------------------------------------
  // Service Methods
  // --------------------------------------------------------------------------
  getClients(): Observable<Client[]> {
    return of(this.clients()).pipe(delay(300));
  }

  addClient(client: Client): Observable<Client> {
    const maxId = Math.max(...this.clients().map(c => parseInt(c.id)), 0);
    const newId = (maxId + 1).toString();
    const newClient = { ...client, id: newId, invoiceCount: 0 };
    this.clients.update(c => [...c, newClient]);
    this.saveToStorage();
    return of(newClient).pipe(delay(300));
  }

  updateClient(id: string, data: Partial<Client>): Observable<Client> {
    const index = this.clients().findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    const updated = { ...this.clients()[index], ...data };
    this.clients.update(clients => {
      const newClients = [...clients];
      newClients[index] = updated;
      return newClients;
    });
    this.saveToStorage();
    return of(updated).pipe(delay(300));
  }

  deleteClient(id: string): Observable<void> {
    this.clients.update(clients => clients.filter(c => c.id !== id));
    this.saveToStorage();
    return of(undefined).pipe(delay(300));
  }

  getClientInvoiceCount(clientId: string): Observable<number> {
    const count = this.clients().find(c => c.id === clientId)?.invoiceCount || 0;
    return of(count).pipe(delay(100));
  }

  getAll(): Client[] {
    return this.clients();
  }

  getClientById(id: string): Observable<Client | undefined> {
    return of(this.clients().find(c => c.id === id)).pipe(delay(100));
  }

  // --------------------------------------------------------------------------
  // Reset to mock data
  // --------------------------------------------------------------------------
  resetToMockData(): void {
    this.clients.set([...MOCK_CLIENTS]);
    this.saveToStorage();
  }
}