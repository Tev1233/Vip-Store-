/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Order, Product } from '../types';
import { 
  X, Mail, Lock, User, Phone, MapPin, 
  Heart, PackageCheck, Award, Share2, Clipboard, LogIn 
} from 'lucide-react';
import { signUpMember, signInMember, signOutMember, isSupabaseActive } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  orders: Order[];
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onViewInvoice: (order: Order) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  orders,
  allProducts,
  onSelectProduct,
  onViewInvoice
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Chinhoyi');
  const [street, setStreet] = useState('');

  const [authSuccess, setAuthSuccess] = useState('');
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (isSignUp) {
      if (!name || !email || !password || !phone) {
        setAuthError('All registration credentials must be provided.');
        return;
      }
      
      const response = await signUpMember(email, password, {
        name,
        phone,
        address: {
          street: street || 'Central Avenues',
          city: city,
          province: city === 'Chinhoyi' ? 'Mashonaland West' : (city === 'Harare' ? 'Harare Metropolitan' : 'Bulawayo Metropolitan')
        },
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000)
      });

      if (!response.success) {
        setAuthError(response.error || 'Registration failed.');
        return;
      }

      const activeProfile: UserProfile = {
        email,
        name,
        phone,
        address: {
          street: street || 'Central Avenues',
          city: city,
          province: city === 'Chinhoyi' ? 'Mashonaland West' : (city === 'Harare' ? 'Harare Metropolitan' : 'Bulawayo Metropolitan')
        },
        wishlist: [],
        couponsUsed: [],
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000),
        loyaltyPoints: 150
      };

      setCurrentUser(activeProfile);
      setAuthSuccess(response.isMock 
        ? 'Signed up successfully! (Running in Offline Sandbox Mode)' 
        : 'Registered successfully via Supabase Real-time Cloud Auth!'
      );
      setTimeout(() => {
        setAuthSuccess('');
      }, 4000);
    } else {
      // Sign In
      if (!email || !password) {
        setAuthError('Please fill in both email and password.');
        return;
      }

      const response = await signInMember(email, password);

      if (!response.success) {
        setAuthError(response.error || 'Authentication rejected. Verification failed.');
        return;
      }

      if (response.profile) {
        setCurrentUser(response.profile);
        setAuthSuccess(response.isMock 
          ? 'Welcome back! Loaded profile from offline safe registry.' 
          : 'Authenticated successfully under Supabase security tokens!'
        );
        setTimeout(() => {
          setAuthSuccess('');
        }, 4000);
      }
    }
  };

  const handleLogout = async () => {
    await signOutMember();
    setCurrentUser(null);
    setAuthSuccess('Logged out successfully.');
    setTimeout(() => setAuthSuccess(''), 2000);
  };

  const userOrders = orders.filter(o => o.customerEmail === (currentUser?.email || ''));

  return (
    <div id="auth-modal-root" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-zinc-200 max-w-xl w-full rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header toolbar */}
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <LogIn className="h-4.5 w-4.5 text-[#D4AF37]" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#222]">
              {currentUser ? 'VIP Client Account Room' : isSignUp ? 'Request VIP Membership/SignUp' : 'Sign In to VIP Dashboard'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-3 sm:p-1.5 hover:bg-zinc-100 border border-zinc-200 rounded-sm text-zinc-400 hover:text-black transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Outer content container */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-zinc-600 leading-relaxed scrollbar-thin">
          
          {authSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-850 rounded-sm font-bold font-sans animate-pulse">
              ✓ {authSuccess}
            </div>
          )}

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm font-bold font-sans">
              ✗ {authError}
            </div>
          )}

          {currentUser ? (
            /* VERIFIED LOGGED-IN ACCOUNT SCREEN */
            <div className="space-y-6">
              
              {/* Profile card KPI overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-sm space-y-2">
                  <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[8px]">Verified Member</span>
                  <p className="text-lg font-extrabold text-zinc-900 leading-none">{currentUser.name}</p>
                  <p className="text-zinc-600 font-mono text-[10.5px]">{currentUser.email}</p>
                  <p className="text-zinc-600 font-mono">{currentUser.phone}</p>
                </div>

                <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-[#D4AF37]" /> Reward Point Balance
                    </span>
                    <span className="text-[9px] bg-zinc-100 text-zinc-805 px-2 py-0.5 rounded-sm border border-zinc-200 font-bold">
                      Elite Status
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-extrabold text-emerald-700 font-mono">{currentUser.loyaltyPoints} PTS</span>
                    <p className="text-[10px] text-zinc-500">Earn 10 points per 1 USD checkout spent</p>
                  </div>
                </div>
              </div>

              {/* Delivery Addresses */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm space-y-2">
                <h4 className="font-bold text-zinc-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" /> Defaults Shipping Registry
                </h4>
                <p className="text-zinc-900 text-[11px] font-sans font-extrabold">{currentUser.address.street}</p>
                <p className="text-zinc-600">{currentUser.address.city}, {currentUser.address.province}</p>
              </div>

              {/* Referral Codes sharing */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <h4 className="font-extrabold text-[9px] tracking-widest text-zinc-550 uppercase flex items-center gap-1.5">
                    <Share2 className="h-4 w-4 text-[#D4AF37]" /> Share Referral Link
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-bold">+150 Points per registration</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://vip.co.zw/invite?code=${currentUser.referralCode}`}
                    className="flex-1 p-2 bg-white font-mono text-[9.5px] text-zinc-600 border border-zinc-200 rounded-sm focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://vip.co.zw/invite?code=${currentUser.referralCode}`);
                      setAuthSuccess('Copied referral URL to clipboard!');
                      setTimeout(() => setAuthSuccess(''), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-black hover:bg-zinc-800 text-white font-bold rounded-sm"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Order history ledger */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-500 uppercase tracking-widest text-[9.5px] flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                  <PackageCheck className="h-4 w-4 text-zinc-500" /> Historic Order Log ({userOrders.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userOrders.map((ord, idx) => (
                    <div key={idx} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-sm flex justify-between items-center">
                      <div>
                        <p className="font-bold text-zinc-900 font-mono text-[11px]">{ord.id}</p>
                        <p className="text-[10px] text-zinc-500">{ord.date} | {ord.items.length} clothing item(s)</p>
                        <span className={`inline-block mt-1 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-sm ${
                          ord.status === 'Delivered' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-850 border border-amber-200 animate-pulse'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-right space-y-1.5 shrink-0">
                        <p className="font-bold text-zinc-900 font-mono">${ord.total.toFixed(2)}</p>
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="px-2.5 py-1 text-[10px] bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-250 rounded-sm transition-all font-sans font-bold"
                        >
                          Invoice Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                  {userOrders.length === 0 && (
                    <p className="text-center text-zinc-400 py-6 border border-dashed border-zinc-200 rounded-sm">
                      No fashion purchases registered under this email log yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Wishlist management lists */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-500 uppercase tracking-widest text-[9.5px] flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                  <Heart className="h-4 w-4 text-rose-600" /> Your Favorite Wardrobe wishlist ({currentUser.wishlist.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentUser.wishlist.map(pId => {
                    const match = allProducts.find(p => p.id === pId);
                    if (!match) return null;
                    return (
                      <div 
                        key={pId}
                        onClick={() => {
                          onSelectProduct(match);
                          onClose();
                        }}
                        className="p-2.5 bg-zinc-50 border border-zinc-200 hover:border-[#D4AF37] rounded-sm cursor-pointer transition-all space-y-1.5 flex flex-col justify-between"
                      >
                        <img 
                          src={match.images[0]} 
                          alt="" 
                          className="w-full aspect-[4/5] object-cover rounded-sm" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div>
                          <p className="font-bold text-zinc-900 truncate text-[11px]">{match.name}</p>
                          <p className="text-[#D4AF37] font-sans font-bold text-[10.5px]">${match.price.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {currentUser.wishlist.length === 0 && (
                    <div className="col-span-full py-6 text-center text-zinc-400">
                      No clothing designs added to wishlist catalog yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Logout buttons triggers */}
              <button
                onClick={handleLogout}
                className="w-full py-2.5 border border-rose-350 hover:bg-rose-50 text-rose-700 transition-all font-bold tracking-wider uppercase rounded-sm cursor-pointer text-[10px]"
              >
                Sign Out / Disconnect Member Client
              </button>

            </div>
          ) : (
            /* NON LOGGED-IN: INTERACTIVE SIGN IN / SIGN UP FORMS */
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-zinc-700">
              
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm text-zinc-600 space-y-2 leading-relaxed">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-zinc-900">🔥 Supabase + Postgres Secure Connection</p>
                  <span className={`px-2 py-0.5 rounded-sm font-mono text-[9px] font-bold ${
                    isSupabaseActive() 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {isSupabaseActive() ? 'LIVE PRODUCTION' : 'SANDBOX SIMULATOR'}
                  </span>
                </div>
                <p className="text-[10.5px]">
                  {isSupabaseActive() 
                    ? 'Connected directly to live secure Supabase servers. User profiles and account registries are synced under real-time cloud clusters.' 
                    : 'Register an account to store wishlists, orders, shipping coordinates and unlock 150 loyalty points immediately.'}
                </p>
              </div>

              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1"><User className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Full Member Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1"><Mail className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Member Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {isSignUp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1"><Phone className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Zimbabwe Mobile</label>
                    <input
                      type="tel"
                      required
                      placeholder="+263777123456"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1"><MapPin className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Metropolitan Area</label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37] font-sans"
                    >
                      <option value="Chinhoyi">Chinhoyi (HQ)</option>
                      <option value="Harare">Harare Metro</option>
                      <option value="Bulawayo">Bulawayo Metro</option>
                      <option value="Mutare">Mutare</option>
                      <option value="Gweru">Gweru</option>
                      <option value="Masvingo">Masvingo</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1"><Lock className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Account Security Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>

              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1"><MapPin className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Street Address / Suburb</label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="e.g. Block C, Chinhoyi Plaza, Chinhoyi"
                    className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-black hover:bg-zinc-800 text-white font-bold tracking-widest uppercase text-xs rounded-sm transition-all border border-black cursor-pointer shadow-sm"
              >
                {isSignUp ? 'Generate Database Credentials' : 'Authenticate Security Lock'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-[#D4AF37] hover:underline font-bold transition-all"
                >
                  {isSignUp ? 'Already a registered VIP member? Sign In' : 'New to VIP Elite Fashion? Setup Account'}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
