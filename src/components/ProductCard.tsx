/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, Star, ShoppingCart, Percent, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onSelect: () => void;
  onAddToWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
}

export default function ProductCard({ 
  product, 
  onSelect, 
  onAddToWishlist, 
  onAddToCart, 
  isWishlisted 
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic Badges
  const showBadge = product.isNew || product.isBestSeller || product.isClearance || product.isFlashSale;

  return (
    <motion.div
      id={`product-card-${product.id}`}
      className="bg-white border border-zinc-100 rounded-sm overflow-hidden shadow-sm hover:shadow-md group relative flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 cursor-pointer" onClick={onSelect}>
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Wishlist Floating Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-3 sm:p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted 
              ? 'bg-black text-white shadow-md' 
              : 'bg-white/80 text-zinc-700 hover:text-black hover:bg-white'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Display Badge (Top Left Corner) */}
        {showBadge && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isFlashSale && (
              <span className="bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-0.5 shadow-sm">
                <Zap className="h-2.5 w-2.5 animate-bounce" /> Flash Sale
              </span>
            )}
            {product.isClearance && (
              <span className="bg-black text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-0.5 shadow-sm">
                <Percent className="h-2.5 w-2.5 text-[#D4AF37]" /> Clearance
              </span>
            )}
            {product.isNew && (
              <span className="bg-[#D4AF37] text-black font-extrabold text-[8.5px] uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-zinc-800 text-white font-extrabold text-[8.5px] uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                BEST SELLER
              </span>
            )}
          </div>
        )}

        {/* Low Stock Alert Strip */}
        {product.stock <= product.lowStockThreshold && product.stock > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white font-extrabold text-[9px] uppercase text-center py-1 font-sans tracking-wide">
            Only {product.stock} left in stock!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="border border-red-500 text-red-500 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 bg-white/90 rounded-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Information Footer */}
      <div className="p-4 space-y-2 flex-grow flex flex-col justify-between bg-white text-zinc-950">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-1">
            <span className="text-[10px] uppercase font-extrabold text-zinc-400 font-sans tracking-widest">{product.category}</span>
            <div className="flex items-center gap-0.5 shrink-0 text-[#D4AF37]">
              <Star className="h-2.5 w-2.5 fill-current" />
              <span className="text-[10px] font-bold text-zinc-500 font-mono">{product.rating}</span>
            </div>
          </div>
          
          <h3 
            onClick={onSelect}
            className="text-[13px] font-bold text-zinc-900 hover:text-[#D4AF37] cursor-pointer transition-colors max-line-clamp-2 leading-snug line-clamp-2 h-10 overflow-hidden"
          >
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 font-sans">
            <span className="text-sm font-bold text-black">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10.5px] line-through text-zinc-400 font-mono">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button
            disabled={product.stock === 0}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={`p-3 sm:p-2 rounded-sm transition-all ${
              product.stock === 0 
                ? 'bg-zinc-105 text-zinc-400 cursor-not-allowed border border-zinc-200' 
                : 'bg-black hover:bg-zinc-805 text-white active:scale-95 shadow-sm'
            }`}
            title="Instant Add to Cart"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </motion.div>
  );
}
