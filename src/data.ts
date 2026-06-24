/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Coupon } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // Jackets & Hoodies
  {
    id: 'p1',
    name: 'Bespoke Suede Bomber Jacket',
    price: 49.99,
    originalPrice: 85.00,
    description: 'A classic, luxury suede bomber jacket styled with micro-stitch cuffs, double-entry front zip, and tailored slim fit. Engineered with water-repellent shell lining, making it extremely durable and light.',
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Midnight Black', 'Rich Gold', 'Sand Beige'],
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 34,
    stock: 25,
    lowStockThreshold: 5,
    isNew: true,
    isBestSeller: true
  },
  {
    id: 'p2',
    name: 'VIP Icon Heavyweight Hoodie',
    price: 32.50,
    originalPrice: 45.00,
    description: 'Ultra-luxurious heavyweight fleece hoodie. French Terry interior, signature gold embroidered VIP emblem, and high-density dual drawstring. Perfect for cooler evenings in Chinhoyi and Bulawayo.',
    category: 'Hoodies',
    sizes: ['XS', 'M', 'L', 'XL', 'XXL'],
    colors: ['Noir Black', 'Snow White', 'Emerald Green'],
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 57,
    stock: 12,
    lowStockThreshold: 4,
    isFlashSale: true
  },
  // Women's / Dresses
  {
    id: 'p3',
    name: 'Seraphina Pleated Silk Dress',
    price: 59.99,
    originalPrice: 110.00,
    description: 'Stunning premium lightweight silk pleated dress featuring a draped golden waistband and exquisite low-back profile. Highly breathable weave, optimized for exceptional climate comfort throughout the year.',
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Crimson Red', 'Midnight Black', 'Emerald Green'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539008835140-73604de08d8c?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 22,
    stock: 18,
    lowStockThreshold: 3,
    isNew: true
  },
  {
    id: 'p4',
    name: 'Premium Classic Linen Shirt',
    price: 24.99,
    originalPrice: 35.00,
    description: 'Lightweight linen shirt woven from fine flax. Designed to maximize air ventilation for absolute coolness on hot sunny days. Semi-spread dress collar and adjustable mitred cuffs.',
    category: 'Shirts',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Royal Blue', 'Pure White', 'Sky Blue'],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620012253295-c05518e993b2?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 41,
    stock: 40,
    lowStockThreshold: 8,
    isBestSeller: true
  },
  // Underwear
  {
    id: 'p5',
    name: 'Elite Breathable Bamboo Boxers (3-Pack)',
    price: 18.00,
    originalPrice: 28.00,
    description: 'Supreme comfort bamboo-fiber boxer briefs. Features silky-smooth waist elasticity, anti-chafing active seams, and exceptional moisture wicking. Pack features 3 stylish high-contrast colors.',
    category: 'Underwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Classic Multi-Pack'],
    images: [
      'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 88,
    stock: 35,
    lowStockThreshold: 6,
    isBestSeller: true
  },
  // Hats
  {
    id: 'p6',
    name: 'Aero-Mesh Premium Trucker Cap',
    price: 9.99,
    originalPrice: 15.00,
    description: 'Durable structured trucker cap with custom golden embroidered VIP seal. Equipped with side-vented high airflow mesh panels to keep you feeling cool and shaded during dry Zimbabwean summers.',
    category: 'Hats',
    sizes: ['One Size (Adjustable)'],
    colors: ['Stellar Black', 'Golden Navy'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.5,
    reviewsCount: 16,
    stock: 3,
    lowStockThreshold: 4,
    isClearance: true
  },
  // Shoes
  {
    id: 'p7',
    name: 'Hyper-Stride Breathable Knit Sneakers',
    price: 34.99,
    originalPrice: 55.00,
    description: 'State-of-the-art featherlight knit sneakers built with responsive spring midsoles. Designed with specialized high-grip outer grooves for maximum stability on uneven roads and active workouts.',
    category: 'Shoes',
    sizes: ['40', '41', '42', '43', '44', '45'],
    colors: ['Charcoal Black', 'Vibrant White', 'Crimson Red'],
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 95,
    stock: 22,
    lowStockThreshold: 5,
    isFlashSale: true,
    isBestSeller: true
  },
  {
    id: 'p8',
    name: 'Aventador Hand-Stitched Leather Loafers',
    price: 45.00,
    originalPrice: 79.99,
    description: 'Distinguished full-grain premium leather loafers featuring elegant buckle accents. Cushioned memory foam insoles provide supreme comfort for business and corporate fashion meetings.',
    category: 'Shoes',
    sizes: ['41', '42', '43', '44'],
    colors: ['Tan Chelsea Brown', 'Midnight Black'],
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614252329306-2244c0840b3e?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 19,
    stock: 8,
    lowStockThreshold: 2,
    isNew: true
  },
  // Watches
  {
    id: 'p9',
    name: 'VIP Chrono Gold Mechanical Watch',
    price: 65.00,
    originalPrice: 120.00,
    description: 'A striking statement of luxury. Fully visible automatic mechanical tourbillon center, 18K gold electroplated outer bezels, and durable anti-scratch sapphire display window. Requires zero batteries.',
    category: 'Watches',
    sizes: ['Adjustable Strap'],
    colors: ['Imperial Gold', 'Obsidian Black/Gold'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 42,
    stock: 5,
    lowStockThreshold: 2,
    isNew: true,
    isBestSeller: true
  },
  // Bags
  {
    id: 'p10',
    name: 'Elite Waterproof Leather Backpack',
    price: 38.00,
    originalPrice: 65.00,
    description: 'Sleek, rain-resistant modular commuter backpack. Built with dedicated 16-inch velvet shock laptop sleeve, concealed rear passport pouch, and embedded external USB-C fast charge utility port.',
    category: 'Bags',
    sizes: ['20L Volume'],
    colors: ['Matte Black', 'Storm Gray'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 31,
    stock: 15,
    lowStockThreshold: 3,
    isBestSeller: true
  },
  // Accessories & Kids
  {
    id: 'p11',
    name: 'Metropolitan Gold Aviator Sunglasses',
    price: 15.00,
    originalPrice: 25.00,
    description: 'High protection UV400 metallic aviator sunglasses engineered with specialized lightweight gold-alloy bridges and impact-resistant polarized black shading. Extremely fashionable.',
    category: 'Accessories',
    sizes: ['Standard Unisex'],
    colors: ['Gilded Gold', 'Obsidian Silver'],
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 29,
    stock: 50,
    lowStockThreshold: 10,
    isFlashSale: true
  },
  {
    id: 'p12',
    name: 'Junior Adventure Denim Set (Kids)',
    price: 19.99,
    originalPrice: 32.00,
    description: 'Comfort-stretch breathable cotton denim set for active children. Features adjustable waist-straps, robust knee stitching, and safe non-toxic copper utility snaps. Includes jacket and jeans.',
    category: 'Kids',
    sizes: ['Age 3-4', 'Age 5-6', 'Age 7-8', 'Age 9-10'],
    colors: ['Classic Indigo Indigo', 'Washed Light Blue'],
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 15,
    stock: 8,
    lowStockThreshold: 3,
    isClearance: true
  }
];

export interface ZimbabweCity {
  name: string;
  province: string;
  shippingCost: number;
  deliveryEstimate: string;
}

export const ZIMBABWE_CITIES: ZimbabweCity[] = [
  { name: 'Chinhoyi', province: 'Mashonaland West', shippingCost: 2.00, deliveryEstimate: '1-2 Days (Express same-day available)' },
  { name: 'Harare', province: 'Harare Metropolitan', shippingCost: 3.50, deliveryEstimate: '2 Days via Courier' },
  { name: 'Bulawayo', province: 'Bulawayo Metropolitan', shippingCost: 4.50, deliveryEstimate: '2-3 Days via Overnight Runner' },
  { name: 'Mutare', province: 'Manicaland', shippingCost: 3.50, deliveryEstimate: '2 Days via Courier' },
  { name: 'Gweru', province: 'Midlands', shippingCost: 4.00, deliveryEstimate: '2 Days via Courier' },
  { name: 'Kwekwe', province: 'Midlands', shippingCost: 4.00, deliveryEstimate: '2 Days via Courier' },
  { name: 'Masvingo', province: 'Masvingo Province', shippingCost: 4.00, deliveryEstimate: '2-3 Days via Courier' },
  { name: 'Marondera', province: 'Mashonaland East', shippingCost: 2.50, deliveryEstimate: '1-2 Days' },
  { name: 'Beitbridge', province: 'Matabeleland South', shippingCost: 5.00, deliveryEstimate: '3 Days via overnight parcel' },
  { name: 'Victoria Falls', province: 'Matabeleland North', shippingCost: 6.00, deliveryEstimate: '3 Days flight shipment' },
  { name: 'Other Town/Rural Outpost', province: 'Zimbabwe nationwide Courier', shippingCost: 7.00, deliveryEstimate: '3-4 Days via Swift/FedEx partner' }
];

export const AVAILABLE_COUPONS: Coupon[] = [
  { code: 'VIPBOOST', discountPercent: 15, description: '15% Off VIP elite launch discount', minSpend: 0 },
  { code: 'SAVE10', discountPercent: 10, description: '10% Off regular summer collection orders', minSpend: 15 },
  { code: 'ZIMWELCOME', discountPercent: 20, description: '20% Off for orders over USD $30', minSpend: 30 }
];

export const WHATSAPP_CONFIG = {
  phoneNumber: '+263777123456', // Simulated business number
  defaultText: 'Hello VIP Store Zimbabwe! I would like to place an order or ask support about products...'
};
