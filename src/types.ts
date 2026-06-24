/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  lowStockThreshold: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isClearance?: boolean;
  isFlashSale?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentPhone?: string; // For EcoCash/OneMoney
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    phone: string;
  };
  trackingNumber: string;
  notes?: string;
  discountUsed?: number;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  address: {
    street: string;
    city: string;
    province: string;
  };
  wishlist: string[]; // Product IDs
  couponsUsed: string[];
  referralCode: string;
  loyaltyPoints: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  minSpend: number;
}
