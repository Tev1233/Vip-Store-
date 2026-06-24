/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Product, Review } from '../types';
import ReviewsSection from './ReviewsSection';
import { X, Heart, ShoppingBag, Landmark, Sparkles, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: string, selectedColor: string, quantity: number) => void;
  onAddToWishlist: (productId: string) => void;
  isWishlisted: boolean;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onAddToWishlist,
  isWishlisted,
  reviews,
  onAddReview
}: ProductDetailModalProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successNotif, setSuccessNotif] = useState(false);

  if (!product) return null;

  // Initialize variant defaults safely
  const activeSize = selectedSize || product.sizes[0] || 'Standard';
  const activeColor = selectedColor || product.colors[0] || 'Default';

  const handleAddToCartClick = () => {
    onAddToCart(product, activeSize, activeColor, quantity);
    setSuccessNotif(true);
    setTimeout(() => {
      setSuccessNotif(false);
    }, 2500);
  };

  return (
    <div id="product-detail-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
      <div 
        id="product-detail-card" 
        className="bg-neutral-950 border border-neutral-850 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header bar controls */}
        <div className="p-4 border-b border-neutral-900 bg-neutral-950 flex justify-between items-center text-xs text-neutral-400">
          <span className="font-bold tracking-wider uppercase text-[10px] text-amber-500">Premium Fashion SKU Catalogue</span>
          <button 
            onClick={onClose}
            className="p-3 sm:p-1.5 hover:bg-neutral-900 rounded-full border border-neutral-800 text-neutral-300 hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable Layout */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Gallery images */}
            <div className="space-y-3">
              <div className="aspect-[3/4] overflow-hidden bg-neutral-900 border border-neutral-900 rounded-xl relative">
                <img 
                  src={product.images[selectedImageIdx] || product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              
              {/* Thumbnail Slider Grid */}
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-20 rounded-lg overflow-hidden bg-neutral-900 border-2 transition-all ${
                      selectedImageIdx === idx ? 'border-amber-500 scale-102' : 'border-neutral-900'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product description specifications */}
            <div className="space-y-6 text-xs text-neutral-300">
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">{product.category}</span>
                <h2 className="text-xl font-bold tracking-tight text-white leading-snug">{product.name}</h2>
              </div>

              {/* Pricing section */}
              <div className="flex items-baseline gap-2.5 pb-2 border-b border-neutral-900">
                <span className="text-xl font-extrabold text-amber-400 font-mono">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-sm line-through text-neutral-500 font-mono">${product.originalPrice.toFixed(2)}</span>
                )}
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 ml-2">
                  USD Cash Pricing
                </span>
              </div>

              {/* Variants sizes selectors */}
              {product.sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Available Sizes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-3 sm:px-3 sm:py-1.5 text-[10.5px] font-bold font-mono tracking-wide rounded-md border transition-all ${
                          activeSize === size
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-500/30'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants colors selectors */}
              {product.colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Color Variants</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4.5 py-3 sm:px-3.5 sm:py-1.5 text-[10.5px] rounded-full border transition-all font-sans font-semibold ${
                          activeColor === color
                            ? 'bg-neutral-900 border-amber-500 text-amber-400'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selectors and checkout triggers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">Order Quantity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg text-sm select-none">
                    <button 
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-4 py-3 sm:px-3 sm:py-1.5 text-neutral-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 font-bold font-mono text-white text-xs">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="px-4 py-3 sm:px-3 sm:py-1.5 text-neutral-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">({product.stock} units remaining at depot)</span>
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="flex gap-2.5 pt-4">
                
                <button
                  onClick={handleAddToCartClick}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-extrabold tracking-wider uppercase text-xs rounded-xl shadow-lg transition-all ${
                    product.stock === 0
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-850'
                      : 'bg-amber-500 text-neutral-950 hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart Bag
                </button>

                <button
                  onClick={() => onAddToWishlist(product.id)}
                  className={`px-4.5 py-3 rounded-xl border transition-all flex items-center justify-center ${
                    isWishlisted
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-500/30'
                  }`}
                  title="Bookmark"
                >
                  <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

              </div>

              {/* Success alert popover bubble */}
              {successNotif && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-505/30 text-emerald-400 text-[11px] font-bold rounded-lg flex items-center gap-2 animate-pulse font-sans">
                  <Check className="h-4 w-4 shrink-0" />
                  Successfully added {quantity} item(s) to secure cart stack!
                </div>
              )}

              {/* Descriptive Overview details */}
              <div className="bg-neutral-900/40 p-4 border border-neutral-900 rounded-xl space-y-2">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block font-sans">Comfort Specs</span>
                <p className="font-sans leading-relaxed text-neutral-400">{product.description}</p>
              </div>

              {/* Airflow guidelines (Zimbabwe climate optimization stats) */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Material Airflow</span>
                  <p className="text-[10px] text-neutral-400">High-ventilation knit weave preventing moisture trapping in summer heat.</p>
                </div>
                <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Durability Check</span>
                  <p className="text-[10px] text-neutral-400">Reinforced stitching patterns designed against active dust and dirt.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Integrated Dynamic reviews section */}
          <ReviewsSection 
            productId={product.id} 
            reviews={reviews} 
            onAddReview={onAddReview} 
          />

        </div>
      </div>
    </div>
  );
}
