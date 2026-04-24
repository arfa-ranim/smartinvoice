
import { Product } from '../types/product.types';

export function mockProducts(): Product[] {
  return [
    {
      id: '1',
      name: 'Wireless Over-Ear Headphones',
      sku: 'AUD-WH-900',
      description: 'Professional-grade noise cancellation with up to 40 hours of battery life.',
      type: 'physical',
      price: 299.00,
      tax: 15,
      taxLabel: 'VAT',
      stock: 42,
      stockStatus: 'in_stock',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      lowStockThreshold: 10,
      alertEmailLowStock: true
    },
    {
      id: '2',
      name: 'UI/UX Consulting',
      sku: 'SRV-CNSLT-01',
      description: 'Professional audit and design strategy for digital products.',
      type: 'service',
      price: 120.00,
      tax: 0,
      taxLabel: 'Exempt',
      stock: -1,
      stockStatus: 'in_stock',
      isService: true,
      lowStockThreshold: 5,
      alertEmailLowStock: false
    },
    {
      id: '3',
      name: 'Mechanical Keyframe Pro',
      sku: 'KBD-MEC-V2',
      description: 'Compact 75% layout with hot-swappable switches.',
      type: 'physical',
      price: 185.00,
      tax: 10,
      taxLabel: 'GST',
      stock: 4,
      stockStatus: 'low_stock',
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33d50bdf?w=400&h=300&fit=crop',
      lowStockThreshold: 5,
      alertEmailLowStock: true
    },
    {
      id: '4',
      name: 'Backend Security Audit',
      sku: 'SRV-SEC-01',
      description: 'Comprehensive security penetration testing.',
      type: 'service',
      price: 2500.00,
      tax: 21,
      taxLabel: 'VAT',
      stock: -1,
      stockStatus: 'in_stock',
      isService: true,
      lowStockThreshold: 1,
      alertEmailLowStock: false
    },
    {
      id: '5',
      name: 'Architect Table Lamp',
      sku: 'LMP-ARC-44',
      description: 'Adjustable steel frame with warm-light LED.',
      type: 'physical',
      price: 75.00,
      tax: 15,
      taxLabel: 'VAT',
      stock: 0,
      stockStatus: 'out_of_stock',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6e0579b41d8?w=400&h=300&fit=crop',
      lowStockThreshold: 3,
      alertEmailLowStock: true
    }
  ];
}