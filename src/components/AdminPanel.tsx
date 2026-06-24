/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Order, UserProfile } from '../types';
import { 
  BarChart3, Plus, Edit2, Trash2, ShieldAlert, ArrowUpRight, 
  Check, X, FileText, Search, PackageCheck, Users, 
  RefreshCcw, ShoppingBag, FolderGit, AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export default function AdminPanel({ 
  products, setProducts, 
  orders, setOrders, 
  users, setUsers 
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'products' | 'inventory' | 'orders' | 'customers'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product Edit/Add form state
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    category: 'Shirts',
    sizes: ['M', 'L', 'XL'],
    colors: ['Noir Black'],
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop'],
    description: '',
    stock: 20,
    lowStockThreshold: 5,
    isNew: true,
    isBestSeller: false,
    isClearance: false,
    isFlashSale: false
  });

  // Invoice view state
  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);

  // Status Alerts
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setAdminNotification(msg);
    setTimeout(() => setAdminNotification(null), 3500);
  };

  // KPI Calculations
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockAlertsCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

  // Handle Create Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || productForm.price <= 0) {
      triggerNotification('Error: Please enter a logical name and price!');
      return;
    }

    const newProduct: Product = {
      id: 'p-' + Date.now(),
      name: productForm.name,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      category: productForm.category,
      sizes: productForm.sizes,
      colors: productForm.colors,
      images: productForm.images,
      description: productForm.description || 'Premium VIP clothing series.',
      rating: 5.0,
      reviewsCount: 0,
      stock: Number(productForm.stock),
      lowStockThreshold: Number(productForm.lowStockThreshold),
      isNew: productForm.isNew,
      isBestSeller: productForm.isBestSeller,
      isClearance: productForm.isClearance,
      isFlashSale: productForm.isFlashSale
    };

    setProducts(prev => [newProduct, ...prev]);
    setIsAddingProduct(false);
    triggerNotification(`Created product: "${newProduct.name}"`);
  };

  // Handle Edit Product Setup
  const handleEditSetup = (p: Product) => {
    setIsEditingProduct(p);
    setProductForm({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      category: p.category,
      sizes: p.sizes,
      colors: p.colors,
      images: p.images,
      description: p.description,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      isNew: p.isNew || false,
      isBestSeller: p.isBestSeller || false,
      isClearance: p.isClearance || false,
      isFlashSale: p.isFlashSale || false
    });
  };

  // Handle Edit Save
  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProduct) return;

    setProducts(prev => prev.map(p => {
      if (p.id === isEditingProduct.id) {
        return {
          ...p,
          name: productForm.name,
          price: Number(productForm.price),
          originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
          category: productForm.category,
          sizes: productForm.sizes,
          colors: productForm.colors,
          images: productForm.images,
          description: productForm.description,
          stock: Number(productForm.stock),
          lowStockThreshold: Number(productForm.lowStockThreshold),
          isNew: productForm.isNew,
          isBestSeller: productForm.isBestSeller,
          isClearance: productForm.isClearance,
          isFlashSale: productForm.isFlashSale
        };
      }
      return p;
    }));

    setIsEditingProduct(null);
    triggerNotification(`Updated product: "${productForm.name}"!`);
  };

  // Handle Delete Product
  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete "${name}" from the active store?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      triggerNotification(`Deleted product: "${name}"`);
    }
  };

  // Restock action
  const quickRestock = (productId: string, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = p.stock + amount;
        return { ...p, stock: newStock };
      }
      return p;
    }));
    triggerNotification('Stock refilled successfully.');
  };

  // Bulk Seed Action
  const runBulkUploadSeed = () => {
    const extraProducts: Product[] = [
      {
        id: 'p-bulk-1',
        name: 'VIP Executive Cashmere Scarf',
        price: 15.00,
        originalPrice: 28.00,
        description: 'Elite quality handcraft cashmere neck wrap. Features golden embroidery, featherweight weave, and thermal trapping structure built for luxury.',
        category: 'Accessories',
        sizes: ['One Size'],
        colors: ['Champagne Gold', 'Royal Onyx'],
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'],
        rating: 4.9,
        reviewsCount: 12,
        stock: 35,
        lowStockThreshold: 5,
        isNew: true
      },
      {
        id: 'p-bulk-2',
        name: 'Vanguard Ultra-Fit Sports Boxer',
        price: 9.99,
        originalPrice: 15.00,
        description: 'Advanced dynamic stretch anti-sweat support boxers for continuous daytime heat protection.',
        category: 'Underwear',
        sizes: ['M', 'L', 'XL'],
        colors: ['Onyx Black', 'Stone Blue'],
        images: ['https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop'],
        rating: 4.6,
        reviewsCount: 9,
        stock: 15,
        lowStockThreshold: 3,
        isClearance: true
      }
    ];

    setProducts(prev => [...extraProducts, ...prev]);
    triggerNotification('Bulk Upload: Seeding completed! Added 2 deluxe products.');
  };

  // Update order status
  const updateOrderStatus = (orderId: string, text: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: text as any };
      }
      return o;
    }));
    triggerNotification(`Order Status updated to "${text}"`);
  };

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-panel-root" className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 shadow-2xl space-y-8">
      
      {/* Dynamic Floating Toast */}
      {adminNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-neutral-950 font-bold px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-sm border border-amber-300">
          <PackageCheck className="h-5 w-5" />
          {adminNotification}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            VIP Luxury Control Room <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Admin Secure Node</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Unified Zimbabwean operations hub, inventory status alerts and financial dashboard metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={runBulkUploadSeed}
            className="flex items-center gap-1.5 px-4 py-2 border border-neutral-800 hover:border-amber-500/40 text-xs font-medium bg-neutral-900 hover:bg-neutral-900 rounded-lg text-neutral-300 hover:text-white transition-all"
          >
            <FolderGit className="h-3.5 w-3.5 text-amber-500" />
            Bulk Seed (2 Products)
          </button>
          <button 
            onClick={() => {
              setIsAddingProduct(true);
              setProductForm({
                name: '',
                price: 19.99,
                originalPrice: 29.99,
                category: 'Shirts',
                sizes: ['S', 'M', 'L'],
                colors: ['Jet Black'],
                images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop'],
                description: 'Crafted with premium cotton.',
                stock: 25,
                lowStockThreshold: 4,
                isNew: true,
                isBestSeller: false,
                isClearance: false,
                isFlashSale: false
              });
            }}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Custom Product
          </button>
        </div>
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex border-b border-neutral-900 gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'analytics', label: 'Overview Analytics', icon: BarChart3 },
          { id: 'products', label: `Inventory CRUD (${products.length})`, icon: ShoppingBag },
          { id: 'inventory', label: `Low Stock Alerts (${lowStockAlertsCount})`, icon: ShieldAlert },
          { id: 'orders', label: `Fulfillment Orders (${orders.length})`, icon: PackageCheck },
          { id: 'customers', label: `User Directory (${users.length})`, icon: Users },
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isActive = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-400 bg-neutral-900/30'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* Control Views */}
      <div className="space-y-6">

        {/* SECTION 1: SYSTEM OVERVIEW ANALYTICS */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            {/* Bento Cards KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs text-neutral-400 font-medium">USD Cash Flow (Paid & Pending)</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-sans text-amber-400">${totalRevenue.toFixed(2)}</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <ArrowUpRight className="h-2.5 w-2.5" /> +12.4%
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">Includes live EcoCash & cash invoices</p>
              </div>

              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs text-neutral-400 font-medium font-sans">Active Stock Items</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white">{products.length} SKU</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Seeded Core
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">Synced to main Zimbabwe storefront</p>
              </div>

              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs text-neutral-400 font-medium">Critical Stock Alerts</span>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold ${lowStockAlertsCount > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                    {lowStockAlertsCount} Items
                  </span>
                  {lowStockAlertsCount > 0 && <AlertCircle className="h-4 w-4 text-rose-500 animate-bounce" />}
                </div>
                <p className="text-[10px] text-neutral-500">Remaining stock ≤ threshold limits</p>
              </div>

              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs text-neutral-400 font-medium">Direct USSD Payments Received</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white">
                    {orders.filter(o => o.paymentMethod === 'EcoCash' || o.paymentMethod === 'InnBucks').length} Orders
                  </span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">
                    Mobile USSD
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">Paynow automated callbacks</p>
              </div>
            </div>

            {/* Custom SVG Charts Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-6">Zimbabwe Regional Sales Allocations (Est % Volume)</h4>
                
                {/* Custom SVG Bar Grid */}
                <div className="space-y-4">
                  {[
                    { city: 'Chinhoyi (HQ & West Metro)', percentage: 65, color: '#DFBA51', sales: '$4,120' },
                    { city: 'Harare (Metropolitan Area)', percentage: 18, color: '#BFA045', sales: '$1,250' },
                    { city: 'Mutare (Manicaland Core)', percentage: 8, color: '#A0853B', sales: '$540' },
                    { city: 'Gweru & Midlands Zone', percentage: 6, color: '#826C31', sales: '$380' },
                    { city: 'Other Cities (Beitbridge, Masvingo)', percentage: 3, color: '#635327', sales: '$210' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300 font-medium">{item.city}</span>
                        <span className="text-neutral-400 font-mono font-bold">{item.percentage}% ({item.sales})</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${item.percentage}%`, 
                            backgroundColor: item.color 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">Express KPI Conversion Funnel</h4>
                  <p className="text-xs text-neutral-400 mb-6">Optimized for rapid loading on Zimbabwean Econet 3G/4G bandwidth (target conversion benchmark &gt; 3.0%)</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-neutral-950 border border-neutral-850 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-amber-400">1</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-300 font-medium">Home & Scroll Visitors</span>
                          <span className="text-neutral-400 font-mono">10,000 (100%)</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-1.5 rounded-full mt-1">
                          <div className="bg-amber-500 h-full w-full rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-neutral-950 border border-neutral-850 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-amber-400">2</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-300 font-medium">Product Engagement/Zoom</span>
                          <span className="text-neutral-400 font-mono">4,500 (45%)</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-1.5 rounded-full mt-1">
                          <div className="bg-amber-500 h-full w-[45%] rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-neutral-950 border border-neutral-850 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-amber-400">3</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-300 font-medium">Completed Checkout Actions</span>
                          <span className="text-neutral-400 font-mono">340 (3.4%)</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-1.5 rounded-full mt-1">
                          <div className="bg-amber-500 h-full w-[15%] rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: PRODUCT MANAGEMENT CRUD TABLE */}
        {activeSubTab === 'products' && (
          <div className="space-y-4">
            
            {/* Search items inside table */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search active product listing by name or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-900 text-white border border-neutral-800 rounded-lg focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-950 text-neutral-400 font-medium border-b border-neutral-850">
                      <th className="p-4">SKU Product details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Price (USD)</th>
                      <th className="p-4 text-center">Remaining Stock</th>
                      <th className="p-4">Sizes / Colors Info</th>
                      <th className="p-4 text-right">Database CRUD Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-neutral-300">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-900/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.images[0]} 
                              alt="" 
                              className="w-8 h-8 rounded border border-neutral-800 object-cover" 
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                            <div>
                              <p className="font-bold text-white transition-colors">{p.name}</p>
                              <p className="text-[10px] text-neutral-500">{p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-850">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-amber-400">
                          ${p.price.toFixed(2)}
                          {p.originalPrice && (
                            <span className="block text-[10px] line-through text-neutral-500">${p.originalPrice.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                            p.stock === 0 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                              : p.stock <= p.lowStockThreshold 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' 
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[150px] truncate pb-1">
                            <span className="text-neutral-400 font-semibold font-sans">Sizes:</span> {p.sizes.join(', ')}
                          </div>
                          <div className="max-w-[150px] truncate text-[10px] text-neutral-500 font-sans">
                            <span className="text-neutral-400">Colors:</span> {p.colors.join(', ')}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditSetup(p)}
                              className="p-1.5 hover:bg-neutral-850 rounded text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                              title="Edit product values"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 hover:bg-rose-950 rounded text-neutral-500 hover:text-rose-400 border border-neutral-800 hover:border-rose-900 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                          No fashion items matching search parameters were detected.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: INVENTORY TRACKER PANEL */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-white mb-1">Zimbabwe Freight Stock Forecasting</h4>
                <p className="text-neutral-400 leading-relaxed">
                  Low-stock item metrics auto-evaluate when remaining inventory values cross threshold guidelines. Tap any corresponding quick restocking trigger button below to synchronize new shipments without manual database edits.
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-850">
                    <th className="p-4">SKU Details</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Limit Barrier</th>
                    <th className="p-4">Health Check</th>
                    <th className="p-4 text-right">Quick Refill Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {products.map((p) => {
                    const isLow = p.stock <= p.lowStockThreshold;
                    const isOut = p.stock === 0;
                    return (
                      <tr key={p.id} className="hover:bg-neutral-900/30">
                        <td className="p-4 font-bold text-white">{p.name}</td>
                        <td className="p-4 font-bold font-mono">{p.stock}</td>
                        <td className="p-4 text-neutral-500 font-mono">{p.lowStockThreshold}</td>
                        <td className="p-4">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Out of Stock</span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">Low Stock</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400">Sufficient</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => quickRestock(p.id, 5)}
                              className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-[10px] rounded border border-neutral-800 text-neutral-300 hover:text-white transition-all"
                            >
                              +5 SKU
                            </button>
                            <button
                              onClick={() => quickRestock(p.id, 20)}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-neutral-950 text-[10px] rounded border border-amber-500/30 text-amber-400 transition-all"
                            >
                              +20 Bulk SKU
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: ORDER FULFILLMENT & INVOICE MANAGEMENT */}
        {activeSubTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-950 text-neutral-400 font-medium border-b border-neutral-850">
                      <th className="p-4">Order Code / Date</th>
                      <th className="p-4">Recipient Customer</th>
                      <th className="p-4">Destination Province</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4 text-center">Fulfillment Status</th>
                      <th className="p-4 text-right">Cart Total</th>
                      <th className="p-4 text-right">Invoice details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-neutral-300">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-900/30">
                        <td className="p-4">
                          <p className="font-bold text-white text-[11px] font-mono">{o.id}</p>
                          <p className="text-[10px] text-neutral-500">{o.date}</p>
                        </td>
                        <td className="p-4 font-medium">
                          {o.customerName}
                          <div className="text-[10px] text-neutral-500">{o.shippingAddress.phone}</div>
                        </td>
                        <td className="p-4">
                          {o.shippingAddress.city} ({o.shippingAddress.province})
                        </td>
                        <td className="p-4 font-mono font-semibold">
                          <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px] border border-purple-500/20">
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="text-[10px] bg-neutral-950 text-neutral-200 border border-neutral-850 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right font-bold text-amber-400 font-mono">
                          ${o.total.toFixed(2)}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setActiveInvoice(o)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 hover:bg-neutral-850 text-[10px] text-white border border-neutral-800 rounded transition-all"
                          >
                            <FileText className="h-3 w-3 text-amber-400" />
                            Invoice Sheet
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500">
                          No customer orders recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: CUSTOMER DIRECTORY & LOYALTY DATABASE */}
        {activeSubTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 font-medium border-b border-neutral-850">
                    <th className="p-4">Account Holder</th>
                    <th className="p-4">Contact Detail</th>
                    <th className="p-4">Region City</th>
                    <th className="p-4 text-center">Referral ID Code</th>
                    <th className="p-4 text-right">Saved Reward Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900/30">
                      <td className="p-4 font-bold text-white">{u.name}</td>
                      <td className="p-4">
                        <p>{u.email}</p>
                        <p className="text-[10.5px] text-neutral-500 font-mono">{u.phone}</p>
                      </td>
                      <td className="p-4">{u.address.city} • {u.address.province}</td>
                      <td className="p-4 text-center font-mono text-amber-400">{u.referralCode}</td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-400">
                        {u.loyaltyPoints} PTS
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* POPUP 1: ADD PRODUCT FORM MODAL */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-amber-500/20 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white border-b border-neutral-900 pb-2">Add New Product to Zimbabwe Store</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Elegant Gold Dial Dress Suit"
                  className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Original Price (Pre-sale)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Store Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500"
                  >
                    {['Shirts', 'Dresses', 'Jackets', 'Hoodies', 'Shoes', 'Hats', 'Underwear', 'Watches', 'Accessories', 'Bags', 'Kids'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detail the fabric material, care guidelines, wear details..."
                  className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 h-20"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Image URL (JPEG/PNG/Unsplash)</label>
                <input
                  type="text"
                  required
                  value={productForm.images[0]}
                  onChange={e => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-3 rounded border border-neutral-800">
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={e => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="rounded border-neutral-800 text-amber-500"
                  />
                  Mark Tag: "New Arrivals"
                </label>
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={e => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="rounded border-neutral-800 text-amber-500"
                  />
                  Mark Tag: "Best Sellers"
                </label>
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isClearance}
                    onChange={e => setProductForm({ ...productForm, isClearance: e.target.checked })}
                    className="rounded border-neutral-800 text-amber-500"
                  />
                  Mark Tag: "Clearance Sale"
                </label>
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isFlashSale}
                    onChange={e => setProductForm({ ...productForm, isFlashSale: e.target.checked })}
                    className="rounded border-neutral-800 text-amber-500"
                  />
                  Mark Tag: "Flash Sale"
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 hover:bg-neutral-900 text-neutral-400 rounded transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 rounded transition-all"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 2: EDIT PRODUCT VALUES (INLINE) */}
      {isEditingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-amber-500/20 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white border-b border-neutral-900 pb-2 flex justify-between items-center">
              <span>Edit Product: "{isEditingProduct.name}"</span>
              <span className="text-[10px] font-mono text-neutral-400">{isEditingProduct.id}</span>
            </h3>
            <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Original Price (Pre-sale)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Store Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-sans"
                  >
                    {['Shirts', 'Dresses', 'Jackets', 'Hoodies', 'Shoes', 'Hats', 'Underwear', 'Watches', 'Accessories', 'Bags', 'Kids'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:border-amber-500 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-3 rounded border border-neutral-850">
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={e => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="rounded border-neutral-850 text-amber-500"
                  />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={e => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="rounded border-neutral-850 text-amber-500"
                  />
                  Best Seller
                </label>
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isClearance}
                    onChange={e => setProductForm({ ...productForm, isClearance: e.target.checked })}
                    className="rounded border-neutral-850 text-amber-500"
                  />
                  Clearance Sale
                </label>
                <label className="flex items-center gap-2 text-neutral-300">
                  <input
                    type="checkbox"
                    checked={productForm.isFlashSale}
                    onChange={e => setProductForm({ ...productForm, isFlashSale: e.target.checked })}
                    className="rounded border-neutral-850 text-amber-500"
                  />
                  Flash Sale
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(null)}
                  className="px-4 py-2 hover:bg-neutral-900 text-neutral-400 rounded transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 rounded transition-all"
                >
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 3: INVOICE SHEET VIEW MODAL */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div id="invoice-bill-card" className="bg-neutral-950 border border-neutral-800 max-w-2xl w-full rounded-2xl p-8 shadow-2xl text-xs space-y-6">
            
            {/* Invoice Top Section */}
            <div className="flex justify-between items-start border-b border-neutral-900 pb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase block mb-1">OFFICIAL TRANSACTION INVOICE</span>
                <h3 className="text-xl font-bold font-sans text-white">VIP STORE GROUP LTD</h3>
                <p className="text-neutral-500">Shop 4A, First Floor, Chinhoyi Plaza, Chinhoyi</p>
                <p className="text-neutral-500">Phone: +263 777 123 456 | Billing ID: tracking- {activeInvoice.id.slice(4,10)}</p>
              </div>
              <div className="text-right">
                <h4 className="text-lg font-bold font-mono text-white"># {activeInvoice.id}</h4>
                <p className="text-neutral-400">Date: {activeInvoice.date}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-400 rounded-full font-bold uppercase text-[9px] tracking-wide">
                  {activeInvoice.status}
                </span>
              </div>
            </div>

            {/* Recipient Coordinates */}
            <div className="grid grid-cols-2 gap-6 bg-neutral-900/40 p-4 border border-neutral-900 rounded-lg">
              <div>
                <p className="text-neutral-400 font-semibold mb-1">CLIENT DELIVERY COORDINATES:</p>
                <p className="text-white font-bold">{activeInvoice.customerName}</p>
                <p className="text-neutral-400">{activeInvoice.shippingAddress.street}</p>
                <p className="text-white">{activeInvoice.shippingAddress.city}, {activeInvoice.shippingAddress.province}</p>
                <p className="text-neutral-400">Mobile Dial: {activeInvoice.shippingAddress.phone}</p>
              </div>
              <div className="text-right border-l border-neutral-905 pl-6">
                <p className="text-neutral-400 font-semibold mb-1">PAYMENT GATEWAY SPEC:</p>
                <p className="text-white font-mono font-bold">{activeInvoice.paymentMethod}</p>
                <p className="text-neutral-500 mt-1">Status: <span className="text-emerald-400 font-semibold">PAID / CLEAR</span></p>
                {activeInvoice.paymentPhone && (
                  <p className="text-neutral-400">Handset Wallet: {activeInvoice.paymentPhone}</p>
                )}
                <p className="text-amber-400 font-bold mt-2">TOTAL BILL: ${activeInvoice.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-4">
              <span className="block font-bold text-neutral-400 uppercase tracking-widest text-[9.5px]">ITEMIZED DESCRIPTION</span>
              <div className="divide-y divide-neutral-900 border-t border-b border-neutral-900">
                {activeInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5">
                    <div className="flex items-center gap-3">
                      <img 
                        src={it.image} 
                        alt="" 
                        className="w-10 h-10 object-cover rounded border border-neutral-800" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-white font-bold">{it.name}</p>
                        <p className="text-neutral-500 text-[10px]">Variant: Size {it.size} | Color {it.color}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${it.price.toFixed(2)} × {it.quantity}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">${(it.price * it.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals layout */}
            <div className="flex justify-between text-xs pt-2">
              <p className="text-neutral-400 italic">Thank you for supporting Zimbabwean local retail solutions.</p>
              <div className="w-56 space-y-1.5 text-right font-sans">
                <div className="flex justify-between text-neutral-400">
                  <span>Cart Subtotal</span>
                  <span className="text-white font-mono">${activeInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Zimbabwe Shipping Cost</span>
                  <span className="text-white font-mono">${activeInvoice.shippingCost.toFixed(2)}</span>
                </div>
                {activeInvoice.discountUsed && activeInvoice.discountUsed > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Coupon Applied</span>
                    <span className="font-mono">-${activeInvoice.discountUsed.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-neutral-900 pt-1.5">
                  <span className="text-amber-400">Grand Total USD</span>
                  <span className="text-amber-400 font-mono">${activeInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Print and Close controls */}
            <div className="flex gap-2 justify-end pt-4 border-t border-neutral-900">
              <button
                onClick={() => triggerNotification('USSD PDF generator loaded. Saved receipt successfully to folder.')}
                className="px-4 py-2 border border-neutral-800 bg-neutral-900 text-white font-bold rounded-lg hover:border-amber-500/40 transition-all font-sans"
              >
                Print / Download Invoice PDF
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-lg hover:bg-amber-400 transition-all"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
