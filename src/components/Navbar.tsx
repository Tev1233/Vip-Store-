/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import VIPLogo from './VIPLogo';
import { Product, CartItem } from '../types';
import { Search, Heart, ShoppingBag, User, BookOpen, Settings, Sparkles } from 'lucide-react';

interface NavbarProps {
  cart: CartItem[];
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenDocs: () => void;
  allProducts: Product[];
  onSearchSelectProduct: (p: Product) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  currentUserEmail: string | null;
}

export default function Navbar({
  cart,
  wishlistCount,
  onOpenCart,
  onOpenAuth,
  onOpenDocs,
  allProducts,
  onSearchSelectProduct,
  selectedCategory,
  setSelectedCategory,
  currentUserEmail,
}: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  
  // Navigation visibility tracking states (fade up/down on scroll)
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Avoid triggering under negative bounce scroll events
      if (currentScrollY < 0) return;

      // Threshold check to avoid jitter
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;

      if (currentScrollY > lastScrollY && currentScrollY > 70) {
        // Scrolling down -> fade & translate out of frame
        setVisible(false);
      } else {
        // Scrolling up -> fade & slide back in beautifully
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Search suggestions calculations
  const searchResults = searchVal.trim() === '' 
    ? [] 
    : allProducts.filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase())).slice(0, 5);

  const handleSearchItemClick = (p: Product) => {
    onSearchSelectProduct(p);
    setSearchVal('');
    setSearchFocused(false);
  };

  return (
    <nav 
      id="vip-navbar-root" 
      className={`fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300 ease-in-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Brand Anchor - Clicking resets classification indices */}
          <div 
            onClick={() => {
              setSelectedCategory('All');
              document.getElementById('vip-app-shell')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="flex items-center cursor-pointer shrink-0"
          >
            <VIPLogo size="sm" />
          </div>

          {/* Search System - Beautifully Responsive and Centered */}
          <div className="flex-1 max-w-sm sm:max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search premium apparel..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="w-full pl-9 pr-4 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm text-xs text-black placeholder-zinc-405 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/10 transition-all font-sans"
              />
            </div>

            {/* Float autocomplete overlay */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-10 inset-x-0 bg-white border border-zinc-250 rounded-sm shadow-xl z-50 overflow-hidden divide-y divide-zinc-100 text-xs text-zinc-800">
                <div className="p-2 text-[9px] uppercase font-sans font-extrabold tracking-widest text-zinc-400 bg-zinc-50">
                  Fashion Search Matches
                </div>
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSearchItemClick(p)}
                    className="flex items-center gap-2.5 p-2 hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    <img 
                      src={p.images[0]} 
                      alt="" 
                      className="w-7 h-9 rounded-sm border border-zinc-150 object-cover" 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 truncate text-[11px]">{p.name}</p>
                      <p className="text-[10px] text-[#D4AF37] font-sans font-bold">${p.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Deck for Desktop Screens */}
          <div className="hidden md:flex items-center gap-5 text-[11px] font-bold uppercase tracking-wider font-sans">
            {/* Specs Portal */}
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-black transition-colors py-1 cursor-pointer"
              title="Architecture Specs Portal"
            >
              <BookOpen className="h-4 w-4" />
              <span>Portal</span>
            </button>

            {/* Favorites / Wishlist */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-black transition-colors relative py-1 cursor-pointer"
              title="Wishlist Favorites"
            >
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
              {wishlistCount > 0 && (
                <span className="bg-black text-white text-[8px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-black transition-colors relative py-1 cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Cart</span>
              {cart.reduce((s, i) => s + i.quantity, 0) > 0 && (
                <span className="bg-black text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Profile Credentials with active Supabase identity */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-sm text-[11px] transition-colors relative cursor-pointer font-semibold"
              title={currentUserEmail ? `Signed in as ${currentUserEmail}` : "Sign In & Get 150 Points"}
            >
              <User className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>
                {currentUserEmail ? currentUserEmail.split('@')[0] : 'Sign In'}
              </span>
            </button>
          </div>

          {/* Small Profile icon for mobile screen quick authorization */}
          <div className="flex md:hidden items-center">
            <button
              onClick={onOpenAuth}
              className="p-1 px-2 border border-zinc-200 hover:bg-zinc-50 rounded-sm flex items-center gap-1 text-[11px] font-bold text-zinc-800 cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="text-[10px]">
                {currentUserEmail ? currentUserEmail.split('@')[0] : 'Join'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
