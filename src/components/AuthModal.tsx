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
import { signUpMember, signInMember, signOutMember, isSupabaseActive, sendMagicLink, sendPhoneOTP, verifyPhoneOTP } from '../lib/supabase';

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
  const [loginStyle, setLoginStyle] = useState<'email' | 'phone'>('email');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Chinhoyi');
  const [street, setStreet] = useState('');
  
  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOTP, setSimulatedOTP] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [authSuccess, setAuthSuccess] = useState('');
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  // Zimbabwe Mobile Number strict verification and auto-formatting
  const validateAndFormatZimPhone = (ph: string): { isValid: boolean; formatted?: string; error?: string } => {
    const clean = ph.replace(/[\s\-\(\)]/g, '');
    
    // Check match for +26377..., 26377..., 77...
    if (/^(\+263|263)?7[1378]\d{7}$/.test(clean)) {
      let formatted = clean;
      if (clean.startsWith('7')) {
        formatted = '+263' + clean;
      } else if (clean.startsWith('263')) {
        formatted = '+' + clean;
      }
      return { isValid: true, formatted };
    }
    
    // Check match for 077...
    if (/^07[1378]\d{7}$/.test(clean)) {
      const formatted = '+263' + clean.slice(1);
      return { isValid: true, formatted };
    }
    
    return { 
      isValid: false, 
      error: 'Zimbabwe mobile numbers must start with +26377, +26371, +26373, or +26378, followed by 7 digits (or local format e.g. 077...).' 
    };
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!email) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    let profileData = undefined;
    if (isSignUp) {
      if (!name) {
        setAuthError('Please enter your full name for membership registration.');
        return;
      }
      if (!phone) {
        setAuthError('Zimbabwe mobile phone is required for delivery defaults.');
        return;
      }
      const phoneCheck = validateAndFormatZimPhone(phone);
      if (!phoneCheck.isValid) {
        setAuthError(phoneCheck.error);
        return;
      }
      profileData = {
        name,
        phone: phoneCheck.formatted || phone,
        address: {
          street: street || 'Grey Building, Chinhoyi',
          city,
          province: city === 'Chinhoyi' ? 'Mashonaland West' : (city === 'Harare' ? 'Harare Metropolitan' : 'Bulawayo Metropolitan')
        },
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000)
      };
    }

    const res = await sendMagicLink(email, isSignUp, profileData);
    if (res.success) {
      setMagicLinkSent(true);
      if (res.isMock) {
        setAuthSuccess('Simulated Link Dispatched! (Sandbox Mode Active)');
      } else {
        setAuthSuccess('Magic link successfully dispatched! Please check your email inbox.');
      }
    } else {
      setAuthError(res.error || 'Failed to dispatch magic link. Please check your network connection.');
    }
  };

  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!phone) {
      setAuthError('Please enter your Zimbabwe mobile number.');
      return;
    }

    const phoneCheck = validateAndFormatZimPhone(phone);
    if (!phoneCheck.isValid) {
      setAuthError(phoneCheck.error);
      return;
    }

    const finalPhone = phoneCheck.formatted!;

    let profileData = undefined;
    if (isSignUp) {
      if (!name) {
        setAuthError('Please enter your full name for membership registration.');
        return;
      }
      if (!email) {
        setAuthError('Please enter your email address for purchase notifications.');
        return;
      }
      profileData = {
        name,
        phone: finalPhone,
        address: {
          street: street || 'Grey Building, Chinhoyi',
          city,
          province: city === 'Chinhoyi' ? 'Mashonaland West' : (city === 'Harare' ? 'Harare Metropolitan' : 'Bulawayo Metropolitan')
        },
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000)
      };
    }

    const res = await sendPhoneOTP(finalPhone, isSignUp, profileData);
    if (res.success) {
      setOtpSent(true);
      if (res.isMock && res.simulatedOTP) {
        setSimulatedOTP(res.simulatedOTP);
        setAuthSuccess(`Simulated SMS Sent! OTP Code is: ${res.simulatedOTP}`);
      } else {
        setAuthSuccess(`OTP verification code dispatched to ${finalPhone}.`);
      }
    } else {
      setAuthError(res.error || 'Failed to dispatch phone authentication OTP.');
    }
  };

  const handleVerifyPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!otpCode || otpCode.length < 6) {
      setAuthError('Please enter the 6-digit authentication code.');
      return;
    }

    const phoneCheck = validateAndFormatZimPhone(phone);
    const finalPhone = phoneCheck.isValid ? phoneCheck.formatted! : phone;

    let profileData = undefined;
    if (isSignUp) {
      profileData = {
        email: email.toLowerCase(),
        name,
        phone: finalPhone,
        address: {
          street: street || 'Grey Building, Chinhoyi',
          city,
          province: city === 'Chinhoyi' ? 'Mashonaland West' : (city === 'Harare' ? 'Harare Metropolitan' : 'Bulawayo Metropolitan')
        },
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000)
      };
    }

    const res = await verifyPhoneOTP(finalPhone, otpCode, isSignUp, profileData);
    if (res.success && res.profile) {
      setCurrentUser(res.profile);
      localStorage.setItem('vip_active_session_email', res.profile.email);
      setAuthSuccess('Authenticated Successfully. Loading Chinhoyi Hub...');
      setTimeout(() => {
        setAuthSuccess('');
      }, 4000);
    } else {
      setAuthError(res.error || 'OTP code is invalid or has expired. Please try requesting a new code.');
    }
  };

  const handleLogout = async () => {
    await signOutMember();
    setCurrentUser(null);
    localStorage.removeItem('vip_active_session_email');
    setAuthSuccess('Logged out successfully.');
    setOtpSent(false);
    setMagicLinkSent(false);
    setOtpCode('');
    setSimulatedOTP('');
    setTimeout(() => setAuthSuccess(''), 2000);
  };

  const simulateMagicLinkClick = async () => {
    setAuthError('');
    setAuthSuccess('');
    
    // Simulate login for the given email
    const cleanEmail = email.toLowerCase() || 'visitor@vip.co.zw';
    const mockName = name || 'Tendai Moyo';
    const phoneCheck = validateAndFormatZimPhone(phone || '+263776559364');
    const finalPhone = phoneCheck.isValid ? phoneCheck.formatted! : '+263776559364';

    const mockProfile: UserProfile = {
      email: cleanEmail,
      name: mockName,
      phone: finalPhone,
      address: {
        street: street || 'Grey Building, Chinhoyi',
        city,
        province: city === 'Chinhoyi' ? 'Mashonaland West' : (city === 'Harare' ? 'Harare Metropolitan' : 'Bulawayo Metropolitan')
      },
      wishlist: [],
      couponsUsed: [],
      referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000),
      loyaltyPoints: 150
    };

    localStorage.setItem(`mock_profile_${cleanEmail}`, JSON.stringify(mockProfile));
    localStorage.setItem('vip_active_session_email', cleanEmail);
    setCurrentUser(mockProfile);
    setAuthSuccess('Authenticated Successfully. Loading Chinhoyi Hub...');
    setTimeout(() => {
      setAuthSuccess('');
    }, 4000);
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
              {currentUser ? 'VIP Client Account Room' : isSignUp ? 'Request VIP Membership' : 'Sign In to VIP Dashboard'}
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
                    className="flex items-center gap-1 px-3 py-1 bg-black hover:bg-zinc-800 text-white font-bold rounded-sm cursor-pointer"
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
                        <p className="font-bold text-zinc-900 font-mono text-right">${ord.total.toFixed(2)}</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => onViewInvoice(ord)}
                            className="px-2 py-1 text-[9px] bg-white hover:bg-zinc-50 text-zinc-805 border border-zinc-250 rounded-sm transition-all font-sans font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Invoice
                          </button>
                          <a
                            href={`https://wa.me/263776559364?text=${encodeURIComponent(
                              `Hello, I am checking on my order ${ord.id}. Is it ready for collection at the Grey Building in Chinhoyi?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-[9px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-sm transition-all font-sans font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            Track (WA)
                          </a>
                        </div>
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
            <div className="space-y-4 text-zinc-700">
              
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm text-zinc-600 space-y-2 leading-relaxed">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-zinc-900">⚡ Supabase Secure Authentication Hub</p>
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
                    ? 'Connected directly to live secure Supabase servers. User profiles and passwordless credentials are authenticated securely.' 
                    : 'Register an account to store wishlists, orders, shipping coordinates and unlock 150 loyalty points immediately.'}
                </p>
              </div>

              {/* Clean Switch Tab Toggle */}
              <div className="flex bg-zinc-100 p-1 rounded-sm border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginStyle('email');
                    setOtpSent(false);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-1.5 rounded-sm text-[11px] font-bold transition-all ${
                    loginStyle === 'email' ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  ✉️ Email Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginStyle('phone');
                    setOtpSent(false);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-1.5 rounded-sm text-[11px] font-bold transition-all ${
                    loginStyle === 'phone' ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  📱 Phone OTP
                </button>
              </div>

              {loginStyle === 'email' ? (
                /* EMAIL MAGIC LINK MODE */
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-1">
                      <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                        <User className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Full Member Name
                      </label>
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
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                      <Mail className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Member Email Address
                    </label>
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
                        <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                          <Phone className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Zimbabwe Mobile
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+263776559364"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37] font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                          <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Metropolitan Area
                        </label>
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

                  {isSignUp && (
                    <div className="space-y-1">
                      <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Street Address / Suburb
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        placeholder="e.g. Grey Building, Chinhoyi"
                        className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-black hover:bg-zinc-800 text-white font-bold tracking-widest uppercase text-xs rounded-sm transition-all border border-black cursor-pointer shadow-sm"
                  >
                    {isSignUp ? 'Request Membership Link' : 'Send Secure Magic Link'}
                  </button>

                  {magicLinkSent && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm space-y-3">
                      <p className="font-semibold text-[11px] text-zinc-700 text-center">
                        📬 An entry link has been dispatched to <span className="font-mono text-black">{email}</span>.
                      </p>
                      <button
                        type="button"
                        onClick={simulateMagicLinkClick}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-sm text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>🔗 Sandbox Bypass: Simulate Email Click</span>
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* PHONE OTP AUTHENTICATION MODE */
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                      {isSignUp && (
                        <div className="space-y-1">
                          <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                            <User className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Full Member Name
                          </label>
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
                        <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                          <Phone className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Zimbabwe Mobile
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +263776559364 or 0776559364"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37] font-mono"
                        />
                      </div>

                      {isSignUp && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                              <Mail className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="name@gmail.com"
                              className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                              <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Metropolitan Area
                            </label>
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

                      {isSignUp && (
                        <div className="space-y-1">
                          <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                            <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Street Address / Suburb
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={e => setStreet(e.target.value)}
                            placeholder="e.g. Grey Building, Chinhoyi"
                            className="w-full p-2.5 bg-zinc-50 text-black rounded-sm border border-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 mt-4 bg-black hover:bg-zinc-800 text-white font-bold tracking-widest uppercase text-xs rounded-sm transition-all border border-black cursor-pointer shadow-sm"
                      >
                        Send 6-Digit OTP Code
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhoneOTP} className="space-y-4">
                      {simulatedOTP && (
                        <div className="p-3.5 bg-zinc-50 border border-[#D4AF37]/40 rounded-sm text-center">
                          <p className="font-extrabold text-zinc-800 tracking-wider">🔒 SIMULATED SMS GATEWAY</p>
                          <p className="text-[10.5px] text-zinc-500 mt-1">
                            Your security authentication code is: <span className="font-mono font-bold text-emerald-700 text-sm">{simulatedOTP}</span>
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-1">
                          <Lock className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} /> Security OTP Token
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full p-3 bg-zinc-50 text-black rounded-sm border border-zinc-200 text-center text-lg tracking-widest font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold tracking-widest uppercase text-xs rounded-sm transition-all border border-emerald-750 cursor-pointer shadow-sm"
                      >
                        Verify OTP & Access Hub
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                            setSimulatedOTP('');
                            setAuthError('');
                            setAuthSuccess('');
                          }}
                          className="text-zinc-500 hover:text-black font-bold text-[10px] tracking-wide uppercase cursor-pointer"
                        >
                          ← Change Phone / Re-request Code
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Evaluation Shortcut */}
              {!isSignUp && !otpSent && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-sm mt-3 text-center space-y-1.5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Evaluation / Sandbox Shortcut</p>
                  <button
                    type="button"
                    onClick={async () => {
                      setEmail('visitor@vip.co.zw');
                      const response = await verifyPhoneOTP('+263776559364', '123456', false, {
                        email: 'visitor@vip.co.zw',
                        name: 'Tendai Moyo',
                        phone: '+263776559364',
                        address: {
                          street: 'Grey Building, Chinhoyi',
                          city: 'Chinhoyi',
                          province: 'Mashonaland West'
                        },
                        referralCode: 'VIPREF-7712'
                      });
                      if (response.success && response.profile) {
                        setCurrentUser(response.profile);
                        localStorage.setItem('vip_active_session_email', 'visitor@vip.co.zw');
                        setAuthSuccess('Welcome Tendai! Evaluation sandbox session loaded successfully.');
                        setTimeout(() => setAuthSuccess(''), 4000);
                      }
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-250 hover:border-[#D4AF37] rounded-sm font-bold text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔑 Direct Login: Tendai Moyo (Visitor)</span>
                  </button>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setOtpSent(false);
                    setMagicLinkSent(false);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-[#D4AF37] hover:underline font-bold transition-all text-center mx-auto block cursor-pointer"
                >
                  {isSignUp ? 'Already registered with VIP? Access Portal' : 'New to VIP Elite Fashion? Request Membership'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
