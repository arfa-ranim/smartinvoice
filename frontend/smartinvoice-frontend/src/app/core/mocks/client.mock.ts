import { Client } from '../services/client.service';

export function mockClients(): Client[] {
  return [
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
}