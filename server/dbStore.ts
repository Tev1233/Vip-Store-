/**
 * High-performance, memory-persistent DB store mimicking Prisma operations
 * File: /server/dbStore.ts
 */

import { Product } from '../src/types';

// Let's model after our Prisma schema
export interface DBProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in cents
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: string[];
  category: string;
}

export interface DBUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPPORT' | 'CUSTOMER';
  token: string; // Used to simulate secure sessions easily
}

class DBStore {
  private products: DBProduct[] = [];
  private users: DBUser[] = [
    {
      id: 'u-admin',
      email: 'admin@vip.co.zw',
      name: 'Tendai Moyo (Admin)',
      role: 'ADMIN',
      token: 'admin-secret-session-token-999',
    },
    {
      id: 'u-support',
      email: 'support@vip.co.zw',
      name: 'Farai N. (Support)',
      role: 'SUPPORT',
      token: 'support-secret-session-token-555',
    },
    {
      id: 'u-customer',
      email: 'visitor@vip.co.zw',
      name: 'Nomalanga G. (Customer)',
      role: 'CUSTOMER',
      token: 'customer-secret-session-token-111',
    },
  ];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed our backend DB from the store initial listings
    const seeds = [
      {
        id: 'p1',
        sku: 'VIP-JKT-SDB-01',
        name: 'Bespoke Suede Bomber Jacket',
        description: 'A classic, luxury suede bomber jacket styled with micro-stitch cuffs, double-entry front zip, and tailored slim fit.',
        price: 4999, // 49.99 * 100
        stock: 25,
        isActive: true,
        category: 'Jackets',
        images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop']
      },
      {
        id: 'p2',
        sku: 'VIP-HOD-HWT-02',
        name: 'VIP Icon Heavyweight Hoodie',
        description: 'Ultra-luxurious heavyweight fleece hoodie. French Terry interior, signature gold embroidered VIP emblem, and high-density dual drawstring.',
        price: 3250, // 32.50 * 100
        stock: 12,
        isActive: true,
        category: 'Hoodies',
        images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop']
      },
      {
        id: 'p3',
        sku: 'VIP-DRS-SLK-03',
        name: 'Seraphina Pleated Silk Dress',
        description: 'Stunning premium lightweight silk pleated dress featuring a draped golden waistband and exquisite low-back profile.',
        price: 5999, // 59.99 * 100
        stock: 18,
        isActive: true,
        category: 'Dresses',
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop']
      },
      {
        id: 'p4',
        sku: 'VIP-ACC-WTC-04',
        name: 'VIP Chrono Gold Mechanical Watch',
        description: 'Magnificent mechanical watch. Self-winding system, real 18k gold-plated bezels, visible heart movement, and dual chronographs.',
        price: 18500, // 185.00 * 100
        stock: 8,
        isActive: true,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop']
      },
      {
        id: 'p5',
        sku: 'VIP-SHR-LIN-05',
        name: 'Flax Linen Summer Resort Shirt',
        description: 'Pre-washed extra-soft linen resort collar shirt featuring wooden buttons. Tailored lightweight and highly breathable weave.',
        price: 2499, // 24.99 * 100
        stock: 45,
        isActive: false, // Testing quick toggles
        category: 'Shirts',
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200']
      }
    ];

    seeds.forEach(s => {
      const slug = s.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
      this.products.push({
        ...s,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  public getProducts() {
    return this.products;
  }

  public getUserByToken(token: string) {
    return this.users.find(u => u.token === token) || null;
  }

  public getUserByEmail(email: string) {
    return this.users.find(u => u.email === email) || null;
  }

  public verifyRole(token: string, roles: ('ADMIN' | 'SUPPORT')[]) {
    const user = this.getUserByToken(token);
    return user && roles.includes(user.role as any) ? user : null;
  }

  // Live paginated & searched listings
  public queryProducts(search: string, page: number = 1, limit: number = 5) {
    const query = search.trim().toLowerCase();
    const filtered = this.products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );

    const startIndex = (page - 1) * limit;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      pagination: {
        totalProducts: totalCount,
        totalPages,
        currentPage: page,
        limit,
      }
    };
  }

  public createProduct(data: { name: string; sku: string; description: string; price: number; stock: number; category: string; images: string[] }) {
    // Auto-generate slug
    const slug = data.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    
    // Server validation check duplicates
    if (this.products.some(p => p.sku === data.sku)) {
      throw new Error(`SKU "${data.sku}" is already registered in our catalog db.`);
    }
    if (this.products.some(p => p.slug === slug)) {
      throw new Error(`Product slug "${slug}" conflicts with an existing item.`);
    }

    const newProduct: DBProduct = {
      id: 'p-' + Date.now(),
      sku: data.sku,
      name: data.name,
      slug,
      description: data.description,
      price: data.price, // in cents (validated by handler)
      stock: data.stock,
      isActive: true,
      category: data.category || 'Shirts',
      images: data.images && data.images.length ? data.images : ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<DBProduct>) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) {
      throw new Error('Product not found in catalogue database.');
    }

    const current = this.products[idx];

    // Slug check if name changed
    if (updates.name && updates.name !== current.name) {
      const slug = updates.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
      if (this.products.some(p => p.id !== id && p.slug === slug)) {
        throw new Error('Auto-calculated slug conflicts with an existing product item.');
      }
      updates.slug = slug;
    }

    // SKU check
    if (updates.sku && updates.sku !== current.sku) {
      if (this.products.some(p => p.id !== id && p.sku === updates.sku)) {
        throw new Error('SKU duplicate detected in catalog database.');
      }
    }

    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.products[idx] = updated;
    return updated;
  }

  public deleteProduct(id: string) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) {
      throw new Error('Product does not exist.');
    }
    const name = this.products[idx].name;
    this.products.splice(idx, 1);
    return { name };
  }
}

export const dbStore = new DBStore();
