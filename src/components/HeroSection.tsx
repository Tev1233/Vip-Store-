/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer state for Zimbabwe Flash Sales (e.g., target tomorrow midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 34, seconds: 12 }; // reset
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      title: 'THE CORE COLLECTION',
      highlight: 'VIP Elite Luxury',
      subtitle: 'Tailored premium wear designed for high comfort. Standard 48-hour secure delivery Chinhoyi, Harare and nationwide.',
      bgImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
      badge: 'Summer Releases'
    },
    {
      title: 'CHRONO GOLD SERIES',
      highlight: 'Statement Automatics',
      subtitle: 'Premium mechanical dials. Hand-finished accents, zero batteries required. An absolute signifier of status.',
      bgImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
      badge: 'Exclusive Watches'
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  return (
    <div id="hero-slider-section" className="bg-white relative overflow-hidden border-b border-zinc-100">
      
      {/* Background Decorative Particle Accents */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-[#D4AF37] blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-[#D4AF37] blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Frame Viewer */}
      <div className="relative h-[480px] md:h-[550px] w-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Ambient Overlay to optimize readability & image data weight and high contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />
            <img 
              src={slides[currentSlide].bgImage} 
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-65"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Content Box */}
        <div className="relative z-15 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono">
                {slides[currentSlide].badge}
              </span>
            </div>

            {/* Main Typographical Headings */}
            <div className="space-y-2">
              <h2 className="text-zinc-500 font-bold font-sans uppercase tracking-[0.25em] text-xs md:text-sm">
                {slides[currentSlide].title}
              </h2>
              <h1 className="text-4xl md:text-6xl font-serif italic text-black tracking-tight leading-none">
                {slides[currentSlide].highlight}
              </h1>
            </div>

            {/* Description Subtext */}
            <p className="text-zinc-700 font-sans text-xs md:text-sm leading-relaxed max-w-lg">
              {slides[currentSlide].subtitle}
            </p>

            {/* Navigation buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('vip-storefront-products-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex items-center gap-2 px-8 py-3.5 bg-black text-white font-bold rounded-sm text-xs tracking-widest uppercase hover:bg-zinc-800 transition-all border border-black shadow-sm"
              >
                Browse Catalog
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100/80 border border-zinc-200 rounded-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                  Online & Active
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Zimbabwean Local Retail Trust Indicators Under Layer */}
      <div className="bg-zinc-50 border-t border-b border-zinc-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          
          <div className="flex items-center gap-2.5 justify-center md:border-r border-zinc-200/40">
            <div className="p-2 rounded bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <Truck className="h-4 w-4 text-[#D4AF37] shrink-0" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-black tracking-wider uppercase font-sans">USD $2 FLAT DELIVERY</p>
              <p className="text-[9px] text-zinc-500">Fast runner service Chinhoyi Metro</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center md:border-r border-zinc-200/40">
            <div className="p-2 rounded bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <Zap className="h-4 w-4 text-[#D4AF37] shrink-0" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-black tracking-wider uppercase font-sans">ECOCASH USSD LIVE</p>
              <p className="text-[9px] text-zinc-500">Automated Push authorization PIN</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center md:border-r border-zinc-200/40">
            <div className="p-2 rounded bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <ShieldCheck className="h-4 w-4 text-[#D4AF37] shrink-0" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-black tracking-wider uppercase font-sans">SECURE ESCROW DEPOSITS</p>
              <p className="text-[9px] text-zinc-500">InnBucks or Cash on Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center">
            <div className="p-2 rounded bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <RefreshCw className="h-4 w-4 text-[#D4AF37] shrink-0" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-black tracking-wider uppercase font-sans">7-DAY REFUND PORTAL</p>
              <p className="text-[9px] text-zinc-500">Returns handled at Chinhoyi depot</p>
            </div>
          </div>

        </div>
      </div>

      {/* Promotional Flash Sale Bar Countdown */}
      <div className="bg-black text-white border-b border-zinc-100 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Zap className="h-4 w-4 text-[#D4AF37] animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              VIP MID-YEAR EXPRESS <span className="text-[#D4AF37]">FLASH CLEARANCE</span>
            </h3>
            <span className="hidden md:inline text-[10px] bg-[#D4AF37]/20 text-[#F3E5AB] font-mono font-bold px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
              Up to 50% Off
            </span>
          </div>

          {/* Active Timer Display */}
          <div className="flex items-center gap-1.5 justify-center font-mono">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1.5">ENDS IN:</span>
            
            <div className="w-8 py-1 bg-zinc-900 border border-zinc-800 text-white rounded text-center text-[10px] font-bold">
              {String(timeLeft.hours).padStart(2, '0')}h
            </div>
            <span className="text-zinc-650 text-[10px]">:</span>
            <div className="w-8 py-1 bg-zinc-900 border border-zinc-800 text-white rounded text-center text-[10px] font-bold">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </div>
            <span className="text-zinc-650 text-[10px]">:</span>
            <div className="w-8 py-1 bg-zinc-900 border border-zinc-800 text-[#D4AF37] rounded text-center text-[10px] font-bold animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </div>

            <span className="text-[10px] bg-white/10 text-[#F3E5AB] border border-white/10 px-2 py-0.5 rounded font-bold font-mono ml-2">
              Code: ZIMWELCOME (20%)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
