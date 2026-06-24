/**
 * Isolated React Admin Dashboard Application
 * File: /src/AdminApp.tsx
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Search, Plus, Trash2, ShieldAlert, Check, X, 
  RefreshCcw, AlertTriangle, ShieldCheck, LogOut, ChevronLeft, 
  ChevronRight, Sparkles, BookOpen, Layers
} from 'lucide-react';

interface DBProduct {
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

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPPORT' | 'CUSTOMER';
  token: string;
}

export default function AdminApp() {
  // DB & UI States
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Authenticated State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Form State for Adding Product
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [nameInput, setNameInput] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [slugOutput, setSlugOutput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [stockInput, setStockInput] = useState('10');
  const [categoryInput, setCategoryInput] = useState('Shirts');

  // Confirmation Modal for Deletion
  const [productToDelete, setProductToDelete] = useState<DBProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quick Switch Roles to Test RBAC
  const [activeToken, setActiveToken] = useState('admin-secret-session-token-999');

  // Auto-generate URL-friendly slug as user types Name
  useEffect(() => {
    const calculated = nameInput
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_]+/g, '-')   // Replace spaces with hyphens
      .replace(/^-+|-+$/g, '');   // Trim hyphens
    setSlugOutput(calculated);
  }, [nameInput]);

  // Fetch initial profile & check session cookies
  useEffect(() => {
    fetchProfile();
  }, [activeToken]);

  const fetchProfile = async () => {
    try {
      // Simulate transmitting token either through Authorization header
      const res = await fetch('/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setErrorMsg(null);
        fetchProducts(1);
      } else {
        setCurrentUser(null);
        setErrorMsg(data.error || 'Please authenticate first.');
      }
    } catch (err) {
      setErrorMsg('Failed secure validation handshakes with Express backend.');
    }
  };

  // Fetch paginated & searched products
  const fetchProducts = async (targetPage: number = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}&page=${targetPage}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.totalProducts);
        setPage(data.pagination.currentPage);
        setErrorMsg(null);
      } else {
        setErrorMsg(data.error || 'Failed to fetch inventory.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to catalog backend controllers.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on debounce or direct click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  // Optimistic UI Toggle Switch for isActive
  const handleToggleActive = async (product: DBProduct) => {
    const updatedStatus = !product.isActive;

    // 1. Instantly perform the Optimistic UI state update to remain super responsive
    setProducts(prev => 
      prev.map(p => p.id === product.id ? { ...p, isActive: updatedStatus } : p)
    );

    try {
      // 2. Perform background request to apply changes
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ isActive: updatedStatus })
      });

      const data = await res.json();
      if (!data.success) {
        // 3. Rollback state if server returns fail (e.g. security block or validation fail)
        setProducts(prev => 
          prev.map(p => p.id === product.id ? { ...p, isActive: product.isActive } : p)
        );
        showTemporaryError(data.error || 'Server validation error rejecting state changes.');
      } else {
        showTemporarySuccess(`Status of "${product.name}" mutated to ${updatedStatus ? 'ACTIVE' : 'INACTIVE'}.`);
      }
    } catch (err) {
      // Rollback on network failure
      setProducts(prev => 
        prev.map(p => p.id === product.id ? { ...p, isActive: product.isActive } : p)
      );
      showTemporaryError('Network failure occurred during status toggles. Change reverted.');
    }
  };

  // Submit Handler for Add New Product Form
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    if (nameInput.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!skuInput.trim() || !/^[A-Z0-9-]+$/i.test(skuInput)) {
      errors.sku = 'SKU is required and must be alphanumeric (hyphens allowed).';
    }
    if (descriptionInput.trim().length < 5) errors.description = 'Description must be at least 5 characters.';
    
    const priceNum = parseFloat(priceInput);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price matches must be a positive decimal number.';
    }

    const stockNum = parseInt(stockInput, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      errors.stock = 'Stock must be a non-negative integer.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      // Send price as standard decimal - Server translates automatically into Cents (Price in Cents)
      const payload = {
        name: nameInput.trim(),
        sku: skuInput.trim().toUpperCase(),
        description: descriptionInput.trim(),
        price: priceNum, // Normal decimal is automatically formatted to cents inside Express/Prisma
        stock: stockNum,
        category: categoryInput,
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200']
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showTemporarySuccess(`Successfully created product "${data.product.name}" in data ledger!`);
        // Reset Inputs
        setNameInput('');
        setSkuInput('');
        setDescriptionInput('');
        setPriceInput('');
        setStockInput('10');
        setShowAddForm(false);
        // Refresh items list
        fetchProducts(1);
      } else {
        showTemporaryError(data.error || 'Server validation failed during product insertion.');
      }
    } catch (err) {
      showTemporaryError('Database error inserting item catalog.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action Handler (triggers confirmation)
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeletingId(productToDelete.id);

    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });

      const data = await res.json();
      if (data.success) {
        showTemporarySuccess(`Successfully deleted product from central inventory database.`);
        setProductToDelete(null);
        fetchProducts(page);
      } else {
        showTemporaryError(data.error || 'Deletion rejected by server validator.');
      }
    } catch (err) {
      showTemporaryError('Express server refused connection during delete cascades.');
    } finally {
      setDeletingId(null);
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showTemporaryError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Log outputs simulation
  const simulateLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/'; // Redirect back to front retail site
    } catch (err) {
      window.location.href = '/';
    }
  };

  return (
    <div id="vip-app-shell" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Top Banner indicating isolation status */}
      <div className="bg-amber-500 text-neutral-950 font-bold px-4 py-2 text-center text-xs tracking-wider flex items-center justify-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        <span>SECURED ADMIN PORTAL: STRICT MULTI-TENANT ROLE VERIFICATION ENABLED (PORT 3000)</span>
      </div>

      {/* Header Admin section */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-950 text-[#D4AF37] border border-amber-500/20 w-10 h-10 rounded-sm flex items-center justify-center shadow-lg">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-white flex items-center gap-2">
              VIP INVENTORY MANAGER <span className="text-[9px] bg-neutral-950 px-2 py-0.5 rounded text-amber-500 border border-amber-500/10">v2.1</span>
            </h1>
            <p className="text-[10px] text-neutral-505 text-neutral-400">Strict Server-side mutations & database consistency controls</p>
          </div>
        </div>

        {/* Live RBAC role switches - Perfect for testing both admin & support restrictions */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-2 rounded-sm border border-neutral-800">
          <span className="text-[8.5px] font-bold text-neutral-400 uppercase mr-1 tracking-wider">Test RBAC Roles:</span>
          
          <button 
            onClick={() => setActiveToken('admin-secret-session-token-999')}
            className={`px-2.5 py-1 text-[9px] font-bold font-mono rounded transition-all uppercase tracking-wide border cursor-pointer ${
              activeToken === 'admin-secret-session-token-999'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md'
                : 'bg-neutral-905 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🔑 Admin (Full Access / Has Deletes)
          </button>

          <button 
            onClick={() => setActiveToken('support-secret-session-token-555')}
            className={`px-2.5 py-1 text-[9px] font-bold font-mono rounded transition-all uppercase tracking-wide border cursor-pointer ${
              activeToken === 'support-secret-session-token-555'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md'
                : 'bg-neutral-905 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🔒 Support (Limited Access / Toggles Active)
          </button>

          <button 
            onClick={() => setActiveToken('customer-secret-session-token-111')}
            className={`px-2.5 py-1 text-[9px] font-bold font-mono rounded transition-all uppercase tracking-wide border cursor-pointer ${
              activeToken === 'customer-secret-session-token-111'
                ? 'bg-[#E54B4B] text-white border-[#E54B4B] animate-pulse'
                : 'bg-neutral-905 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            💥 Normal Cust (Block Gated!)
          </button>
        </div>

        {/* Current user context details */}
        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <p className="text-[10px] font-mono text-neutral-455 text-amber-500 uppercase">{currentUser.role} PRIVILEGES</p>
            </div>
          )}
          <button 
            onClick={simulateLogout}
            className="p-2 sm:p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all rounded-sm flex items-center gap-2 cursor-pointer text-xs"
            title="Log out from console and view user shop site"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Alerts Center */}
        {errorMsg && (
          <div className="bg-neutral-900 border-l-4 border-red-500 p-4 rounded-sm flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Security / Database Alert</p>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-neutral-500 hover:text-white text-xs p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="bg-neutral-900 border-l-4 border-amber-500 p-4 rounded-sm flex items-start gap-3">
            <Check className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Action Complete</p>
              <p className="text-xs text-neutral-305 text-neutral-300 mt-1 leading-relaxed">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-neutral-500 hover:text-white text-xs p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dashboard Grid and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-sans text-white uppercase tracking-wider">Live Inventory Ledger</h2>
            <p className="text-xs text-neutral-400">Manage real-time catalog indexes, review stock volumes, and toggle product visibility.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                placeholder="Search name, category, SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-sm focus:outline-none placeholder-neutral-500 transition-all font-sans"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            </form>

            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-amber-500 text-neutral-950 text-xs font-bold rounded-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider hover:bg-amber-400"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showAddForm ? 'Close Drawer' : 'Add New Product'}</span>
            </button>
          </div>
        </div>

        {/* Adding product container */}
        {showAddForm && (
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-sm shadow-xl space-y-4 max-w-xl mx-auto">
            <div className="border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#D4AF37]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Add Product (Strict Cent Transformation)</h3>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Product Name Inputs */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Suede Trench Coat"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 text-xs text-white rounded-sm border border-neutral-800 focus:border-amber-500 focus:outline-none"
                  />
                  {formErrors.name && <p className="text-[9.5px] text-red-500">{formErrors.name}</p>}
                </div>

                {/* SKU Code (alphanumeric check) */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">SKU Code *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. VIP-COAT-SDE-09"
                    value={skuInput}
                    onChange={e => setSkuInput(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 text-xs text-white rounded-sm border border-neutral-800 focus:border-amber-500 focus:outline-none uppercase font-mono"
                  />
                  {formErrors.sku && <p className="text-[9.5px] text-red-500">{formErrors.sku}</p>}
                </div>
              </div>

              {/* Readonly Generated Slug */}
              <div className="space-y-1 bg-neutral-950/80 p-2.5 rounded border border-neutral-800">
                <p className="text-[9px] uppercase font-bold tracking-wider text-neutral-500">Auto-Generated URL Slug (Server-Checked)</p>
                <div className="flex items-center gap-1.5 mt-1 font-mono text-[10.5px]">
                  <span className="text-neutral-500">https://vip.co.zw/product/</span>
                  <span className="text-amber-500 font-bold truncate">{slugOutput || '(typing name...)'}</span>
                </div>
              </div>

              {/* Description field */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Description / Fabric Details *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Insert premium features, sizing fits, custom country origin notes..."
                  value={descriptionInput}
                  onChange={e => setDescriptionInput(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 text-xs text-white rounded-sm border border-neutral-800 focus:border-amber-500 focus:outline-none leading-relaxed"
                />
                {formErrors.description && <p className="text-[9.5px] text-red-500">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Category</label>
                  <select
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 text-xs text-white rounded-sm border border-neutral-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Shirts">Shirts</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                {/* Normal Decimal Price - Automatically converts to cents */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Price (Normal USD decimal) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-semibold">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      placeholder="29.99"
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value)}
                      className="w-full pl-7 pr-3 p-2.5 bg-neutral-950 text-xs text-white rounded-sm border border-neutral-800 focus:border-amber-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <span className="text-[8px] text-neutral-500 block leading-none mt-0.5">Auto-converted to {(priceInput && !isNaN(parseFloat(priceInput))) ? Math.round(parseFloat(priceInput) * 100) : 0} cents in DB</span>
                  {formErrors.price && <p className="text-[9.5px] text-red-500">{formErrors.price}</p>}
                </div>

                {/* Stock Input */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Stock Count *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="10"
                    value={stockInput}
                    onChange={e => setStockInput(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 text-xs text-white rounded-sm border border-neutral-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                  {formErrors.stock && <p className="text-[9.5px] text-red-500">{formErrors.stock}</p>}
                </div>

              </div>

              {/* Submit triggers full backend validation */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 bg-neutral-950 text-zinc-400 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-neutral-800 rounded-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-5 py-2.5 bg-amber-500 text-neutral-950 font-bold uppercase text-xs tracking-wider rounded-sm transition-all border border-amber-500 hover:bg-amber-400 cursor-pointer shadow flex items-center gap-1.5"
                >
                  {submitting && <RefreshCcw className="h-3 w-3 animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Datatable Inventory Container */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-neutral-500 flex flex-col items-center gap-3">
              <RefreshCcw className="h-6 w-6 animate-spin text-[#D4AF37]" />
              <p className="text-xs">Synchronizing ledger records with live inventory tables...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 border border-dashed border-neutral-800 m-4 rounded">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2.5 text-neutral-500" />
              <p className="font-semibold text-xs uppercase text-white tracking-widest">No matching products found</p>
              <p className="text-[11px] text-neutral-400 mt-1">Try adjusting search parameters or create a new inventory slot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/40 text-neutral-400 uppercase text-[9.5px] tracking-wider select-none">
                    <th className="p-4 font-bold">INFO BLOCK</th>
                    <th className="p-4 font-bold">SKU</th>
                    <th className="p-4 font-bold">PRICE (USD)</th>
                    <th className="p-4 font-bold text-center">STOCK</th>
                    <th className="p-4 font-bold text-center">VISIBILITY STATUS</th>
                    <th className="p-4 font-bold text-right">ACTION CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 bg-neutral-900/10">
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <motion.tr 
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, backgroundColor: 'rgba(229, 75, 75, 0.15)' }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="hover:bg-neutral-800/30 transition-colors font-sans"
                      >
                        {/* Product details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.images && product.images.length ? product.images[0] : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200'} 
                              alt="" 
                              className="w-10 h-10 object-cover rounded border border-neutral-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-white truncate max-w-full" title={product.name}>{product.name}</p>
                              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{product.category} | {product.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="p-4 font-mono font-bold text-neutral-300">
                          {product.sku}
                        </td>

                        {/* Decimals converted to show user normal format */}
                        <td className="p-4 font-mono font-bold text-white text-xs">
                          ${(product.price / 100).toFixed(2)}
                          <span className="text-[9.5px] text-zinc-500 font-normal block tracking-tight font-mono">({product.price} cents)</span>
                        </td>

                        {/* Stock count */}
                        <td className="p-4 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded-sm font-bold ${
                            product.stock <= 5 
                              ? 'bg-red-950/60 text-red-400 border border-red-900/30' 
                              : 'bg-neutral-950 text-neutral-400'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>

                        {/* Active Toggle switch (Optimistic UI style) */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleActive(product)}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 cursor-pointer ${
                                product.isActive 
                                  ? 'bg-amber-500' 
                                  : 'bg-neutral-700'
                              }`}
                              title={`Click to manually toggle product visibility instantly.`}
                            >
                              <motion.span 
                                layout
                                animate={{ x: product.isActive ? 20 : 4 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs" 
                              />
                            </button>
                            <span className={`ml-2 text-[10px] font-bold font-mono tracking-wide ${
                              product.isActive ? 'text-amber-500' : 'text-neutral-500'
                            }`}>
                              {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        </td>

                        {/* Delete destructive confirmation button */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-2 bg-red-950/40 hover:bg-red-900/70 text-[#E54B4B] hover:text-white border border-red-900/20 rounded font-medium text-[10.5px] tracking-wider transition-all uppercase inline-flex items-center gap-1 cursor-pointer"
                            title="Hard delete catalog record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>

                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          {!loading && products.length > 0 && (
            <div className="p-4 border-t border-neutral-800 flex items-center justify-between select-none">
              <span className="text-[11px] text-zinc-500 font-mono">
                Showing page <strong className="text-white font-bold">{page}</strong> of <strong className="text-white font-bold">{totalPages}</strong> ({totalProducts} total catalog slots)
              </span>

              <div className="flex gap-1">
                <button
                  onClick={() => fetchProducts(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-sm bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Previous inventory catalog section"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => fetchProducts(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-sm bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next inventory catalog section"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Informative Security Panel Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-sm space-y-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Isolation Verified</span>
            <p className="text-xs text-neutral-300">Administrative code bundles and router files are dynamically gated from endpoint serving unless authorized.</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-sm space-y-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Active Audit Logs</span>
            <p className="text-xs text-neutral-300">All data mutations are captured with user tags. Authenticated actions keep catalogs robust for auditing.</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-sm space-y-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Database Engine Parity</span>
            <p className="text-xs text-neutral-300 font-sans">Strict Zod schema parsing and math transformations translate dollars into central database elements seamlessly.</p>
          </div>
        </div>

      </main>

      {/* Confirmation Modal for destructive hard deletes */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-sm overflow-hidden p-6 space-y-4 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 bg-red-950/50 rounded-full border border-red-900/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-sans uppercase tracking-wider">Destructive Delete Action</h3>
                <p className="text-[10px] uppercase font-mono tracking-widest text-[#E54B4B] font-extrabold mt-0.5">Strict Database Cascade</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Are you absolutely certain you want to permanently delete the product <strong className="text-white">"{productToDelete.name}"</strong>? This will remove all associated database relations and inventories, which cannot be reversed.
            </p>

            <div className="bg-neutral-950 p-3 rounded border border-neutral-800 font-mono text-[10.5px] space-y-1">
              <p className="text-neutral-500">DATABASE PARITY TRACKING DETAILS:</p>
              <p><span className="text-neutral-500">ID Key:</span> <span className="text-yellow-600">{productToDelete.id}</span></p>
              <p><span className="text-neutral-500">SKU Code:</span> <span className="text-neutral-300 font-bold">{productToDelete.sku}</span></p>
              <p><span className="text-neutral-500">Slug ID:</span> <span className="text-neutral-400">{productToDelete.slug}</span></p>
            </div>

            {/* Prompt actions with strict role check failure messages if delete rejects */}
            <div className="pt-2 flex justify-end gap-2.5 select-none">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all font-semibold rounded-sm border border-neutral-800 text-xs cursor-pointer"
              >
                No, Keep Product
              </button>
              
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="px-5 py-2 bg-red-650 text-white rounded-sm font-bold font-sans uppercase tracking-wider hover:bg-red-500 transition-all text-xs cursor-pointer border border-red-600 shadow-lg flex items-center gap-1.5"
                style={{ backgroundColor: '#B23A3A' }}
              >
                {deletingId && <RefreshCcw className="h-3 w-3 animate-spin text-white" />}
                <span>Confirms Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="bg-neutral-950 py-10 mt-auto border-t border-neutral-900 text-center text-[10.5px] text-neutral-500 space-y-1.5">
        <p className="font-mono">© 2026 VIP fashion markets LLC . Consolidated Admin System</p>
        <p className="max-w-md mx-auto text-[9.5px]">Strict role authorization and payload isolation ruleset is activated on host container nodes.</p>
      </footer>

    </div>
  );
}
