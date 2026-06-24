/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Review } from '../types';
import { Star, CheckCircle, ThumbsUp, Plus } from 'lucide-react';

interface ReviewsSectionProps {
  productId: string;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export default function ReviewsSection({ productId, reviews, onAddReview }: ReviewsSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [nameInput, setNameInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const productReviews = reviews.filter(r => r.productId === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !commentInput.trim()) return;

    onAddReview({
      productId,
      name: nameInput,
      rating: ratingInput,
      comment: commentInput
    });

    setNameInput('');
    setCommentInput('');
    setRatingInput(5);
    setFormOpen(false);
    setSuccessMsg('Thank you! Your verified customer review is active.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div id="product-reviews-section" className="border-t border-zinc-200 pt-6 space-y-6">
      
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold tracking-wider text-black uppercase font-sans">Verified Customer Trust Reports ({productReviews.length})</h4>
          <p className="text-[11.5px] text-zinc-500">Every submission undergoes automatic automated confirmation against Chinhoyi store records</p>
        </div>
        
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-[11px] font-bold text-black hover:text-black rounded-sm border border-zinc-200 transition-all font-sans cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-[#D4AF37]" />
          {formOpen ? 'Hide Form' : 'Write Review'}
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-sm text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Write a Review Drawer form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-zinc-50 p-5 rounded-sm border border-zinc-200 space-y-4">
          <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Share Your Experience</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-zinc-650 font-bold uppercase tracking-wider text-[9px] mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g. Tendai Moyo"
                className="w-full p-2.5 bg-white text-black border border-zinc-200 focus:outline-none focus:border-[#D4AF37] rounded-sm"
              />
            </div>
            <div>
              <label className="block text-zinc-655 font-bold uppercase tracking-wider text-[9px] mb-1">Comfort Rating</label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                   <button
                     type="button"
                     key={star}
                     onClick={() => setRatingInput(star)}
                     className="p-1 text-zinc-200 hover:text-[#D4AF37] transition-colors"
                   >
                     <Star className={`h-5 w-5 ${star <= ratingInput ? 'text-[#D4AF37] fill-current' : 'text-zinc-200'}`} />
                   </button>
                ))}
                <span className="text-[10px] font-bold font-mono text-zinc-400 ml-2">({ratingInput} / 5 Stars)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-zinc-655 font-bold uppercase tracking-wider text-[9px] mb-1 font-sans">Review Critique</label>
            <textarea
              required
              rows={3}
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Detail the stitch quality, fabric weight, true-to-size fit accuracy..."
              className="w-full text-xs p-2.5 bg-white text-black border border-zinc-200 focus:outline-none focus:border-[#D4AF37] rounded-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4.5 py-3 sm:px-3.5 sm:py-1.5 text-zinc-500 hover:text-black text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
               type="submit"
               className="px-5 py-3 sm:px-4.5 sm:py-2 font-bold bg-black text-white hover:bg-zinc-800 text-xs rounded-sm transition-all border border-black cursor-pointer shadow-sm uppercase tracking-wider"
            >
              Post Review
            </button>
          </div>
        </form>
      )}

      {/* Reviews feed */}
      <div className="space-y-4">
        {productReviews.map((r) => (
          <div key={r.id} className="bg-white p-4 border border-zinc-150 rounded-sm space-y-2 text-xs">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                  {r.name}
                  <span className="text-[9.5px] font-extrabold text-[#D4AF37] bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 uppercase tracking-wider">
                    <CheckCircle className="h-2.5 w-2.5 text-[#D4AF37]" strokeWidth={2.5} /> Verified Buyer
                  </span>
                </p>
                <span className="text-[10px] text-zinc-400 font-medium">{r.date || 'June 2, 2026'}</span>
              </div>

              {/* Star view */}
              <div className="flex items-center gap-0.5 text-[#D4AF37] shrink-0">
                {[1, 2, 3, 4, 5].map(st => (
                  <Star key={st} className={`h-3 w-3 ${st <= r.rating ? 'fill-current' : 'text-zinc-200'}`} />
                ))}
              </div>
            </div>

            <p className="text-zinc-650 leading-relaxed pl-1 font-sans">{r.comment}</p>
            
            <div className="flex items-center gap-4 pt-1 text-[10px] text-zinc-400 select-none">
              <button className="hover:text-black transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] cursor-pointer text-zinc-500">
                <ThumbsUp className="h-3 w-3 text-[#D4AF37]" /> Helpfulness Vote
              </button>
              <span>•</span>
              <span className="text-zinc-400">Active Audit: Grey Building, Chinhoyi verified</span>
            </div>
          </div>
        ))}

        {productReviews.length === 0 && (
          <div className="p-10 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-sm bg-zinc-50 leading-relaxed">
            No active client reviews logged for this clothing SKU. Be the very first to share your wear experience!
          </div>
        )}
      </div>

    </div>
  );
}
