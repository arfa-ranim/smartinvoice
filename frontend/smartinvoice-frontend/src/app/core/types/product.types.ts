export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  type: 'physical' | 'service';
  price: number;
  tax: number;
  taxLabel: string;
  stock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl?: string;
  isService?: boolean;
  lowStockThreshold?: number;
  alertEmailLowStock?: boolean;
}

export type ProductTypeFilter = 'all' | 'physical' | 'service';
export type StockStatusFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  alertEmailLowStock?: boolean;
}