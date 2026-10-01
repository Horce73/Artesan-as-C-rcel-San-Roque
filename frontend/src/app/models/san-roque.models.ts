export interface Workshop {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
  artisans?: Artisan[];
}

export interface Artisan {
  id: string;
  workshopId: string;
  workshop?: Workshop;
  aliasCode: string;
  bioImpactStory: string;
  yearsInWorkshop: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface TraceabilityEvent {
  id: string;
  batchId: string;
  stage: string;
  title: string;
  description: string;
  loggedBy?: string;
  timestamp: string;
}

export interface InventoryBatch {
  id: string;
  productId: string;
  product?: Product;
  trackingCode: string;
  stockQuantity: number;
  batchStatus: string;
  events?: TraceabilityEvent[];
}

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  workshopId: string;
  workshop?: Workshop;
  artisanId?: string;
  artisan?: Artisan;
  title: string;
  description: string;
  price: number;
  sku: string;
  imageUrls: string[];
  stock: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD_OUT';
  isUniquePiece: boolean;
  createdAt: string;
  batches?: InventoryBatch[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  totalAmount: number;
  status: 'PENDING' | 'IN_PROCESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'OPERATOR';
}
