import { Invoice } from '../services/invoice.service';

export function mockInvoices(): Invoice[] {
  return [
    {
      id: 'INV-2024-001',
      clientId: '1',
      client: 'Jane Doe',
      clientInitials: 'JD',
      amount: 2450.00,
      status: 'paid',
      dueDate: new Date(2024, 4, 12),
      notes: 'Paid on time',
      lineItems: [{ description: 'Web design', quantity: 1, price: 2450 }],
      invoiceType: 'sales'
    },
    {
      id: 'INV-2024-002',
      clientId: '2',
      client: 'Robert King',
      clientInitials: 'RK',
      amount: 1200.00,
      status: 'pending',
      dueDate: new Date(2024, 5, 5),
      lineItems: [{ description: 'Consulting', quantity: 2, price: 600 }],
      invoiceType: 'sales'
    },
    {
      id: 'INV-2024-003',
      clientId: '3',
      client: 'Alice Smith',
      clientInitials: 'AS',
      amount: 3420.50,
      status: 'overdue',
      dueDate: new Date(2024, 3, 15),
      lineItems: [{ description: 'Software license', quantity: 1, price: 3420.50 }],
      invoiceType: 'sales'
    },
    {
      id: 'PUR-2024-001',
      clientId: 'supplier1',
      client: 'Office Supplies Inc',
      clientInitials: 'OS',
      amount: 450.00,
      status: 'pending',
      dueDate: new Date(2024, 5, 20),
      lineItems: [{ description: 'Printer paper', quantity: 10, price: 45 }],
      invoiceType: 'purchase'
    },
    {
      id: 'PUR-2024-002',
      clientId: 'supplier2',
      client: 'Web Hosting Ltd',
      clientInitials: 'WH',
      amount: 299.00,
      status: 'paid',
      dueDate: new Date(2024, 4, 10),
      lineItems: [{ description: 'Hosting renewal', quantity: 1, price: 299 }],
      invoiceType: 'purchase'
    }
  ];
}