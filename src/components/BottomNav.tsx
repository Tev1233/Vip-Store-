/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Heart, ShoppingBag, User, BookOpen, Settings, Sparkles 
} from 'lucide-react';
import { CartItem } from '../types';

interface BottomNavProps {
  cart: CartItem[];
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onToggleAdmin: () => void;
  isAdminView: boolean;
  onOpenDocs: () => void;
  currentUserEmail: string | null;
}

export default function BottomNav({
  cart,
  wishlistCount,
  onOpenCart,
  onOpenAuth,
  onToggleAdmin,
  isAdminView,
  onOpenDocs,
  currentUserEmail
}: BottomNavProps) {
  // Calculate total items in cart
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div 
      id="vip-bottom-nav" 
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-150 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] pb-safe font-sans"
    >
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between gap-2.5">
        
        {/* Architecture Specs Portal */}
        <button
          onClick={onOpenDocs}
          className="flex flex-col items-center justify-center flex-1 py-1.5 text-zinc-500 hover:text-black transition-colors"
          title="Architecture Specs Portal"
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 scale-95 origin-top truncate max-w-[64px]">Portal</span>
        </button>

        {/* Quick Toggle to Admin Dashboard */}
        <button
          onClick={onToggleAdmin}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
            isAdminView ? 'text-black font-extrabold' : 'text-zinc-500 hover:text-black'
          }`}
          title="Admin Control Mode"
        >
          <div className="relative">
            {isAdminView ? (
              <Sparkles className="h-5 w-5 text-[#D4AF37] animate-spin" />
            ) : (
              <Settings className="h-5 w-5" />
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 scale-95 origin-top truncate max-w-[64px]">
            {isAdminView ? 'Store' : 'Admin'}
          </span>
        </button>

        {/* Favorites Wishlist */}
        <button
          onClick={onOpenAuth} // Wishlist resides in our auth client modal
          className="flex flex-col items-center justify-center flex-1 py-1.5 text-zinc-500 hover:text-black transition-colors"
          title="Wishlist Favorites"
        >
          <div className="relative">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-bold font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 scale-95 origin-top truncate max-w-[64px]">Favorites</span>
        </button>

        {/* Shopping Cart Trigger */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center flex-1 py-1.5 text-zinc-500 hover:text-black transition-colors"
          title="Secure Shopping Bag"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-bold font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {cartTotalItems}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 scale-95 origin-top truncate max-w-[64px]">Cart</span>
        </button>

        {/* Auth profile credentials door */}
        <button
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center flex-1 py-1.5 text-zinc-500 hover:text-black transition-colors"
          title="Account Profiles"
        >
          <User className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 scale-95 origin-top truncate max-w-[64px]">
            {currentUserEmail ? currentUserEmail.split('@')[0] : 'Profile'}
          </span>
        </button>

      </div>
    </div>
  );
}
