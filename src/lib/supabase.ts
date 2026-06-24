import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Order } from '../types';

let supabaseClient: SupabaseClient | null = null;
let isConfigured = false;

// We'll export a listener or variable to track active status
export const supabaseConfigState = {
  url: '',
  isReady: false,
};

/**
 * Dynamically initialize the Supabase Client if keys are provided.
 */
export function initializeSupabase(url: string | null, anonKey: string | null): boolean {
  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    isConfigured = false;
    supabaseConfigState.isReady = false;
    return false;
  }

  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  // Validate the URL starts with http:// or https:// to prevent client initialization failures
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    console.log('ℹ️ Supabase is not configured with a valid HTTP/HTTPS URL. Reverting to local SQLite/localStorage Sandbox mode.');
    isConfigured = false;
    supabaseConfigState.isReady = false;
    return false;
  }

  // Prevent generic placeholder values
  if (cleanUrl.includes('placeholder') || cleanUrl.includes('YOUR_') || cleanKey.includes('placeholder') || cleanKey.includes('YOUR_')) {
    console.log('ℹ️ Placeholder Supabase keys detected. Defaulting to local sandbox mode.');
    isConfigured = false;
    supabaseConfigState.isReady = false;
    return false;
  }

  try {
    supabaseClient = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    isConfigured = true;
    supabaseConfigState.url = cleanUrl;
    supabaseConfigState.isReady = true;
    console.log('⚡ Supabase Client initialized successfully with URL:', cleanUrl);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    isConfigured = false;
    supabaseConfigState.isReady = false;
    return false;
  }
}

/**
 * Check if real Supabase backend is fully active.
 */
export function isSupabaseActive(): boolean {
  return isConfigured && supabaseClient !== null;
}

/**
 * Get direct access to Supabase Client
 */
export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

/* ==========================================================================
   AUTHENTICATION & PROFILE OPERATIONS
   ========================================================================== */

/**
 * Real Supabase Sign-Up with User Metadata. Fallback to localStorage registry.
 */
export async function signUpMember(
  email: string,
  password: string,
  profileData: Omit<UserProfile, 'email' | 'wishlist' | 'couponsUsed' | 'loyaltyPoints'>
): Promise<{ success: boolean; data?: any; error?: string; isMock?: boolean }> {
  if (isSupabaseActive() && supabaseClient) {
    try {
      // 1. Create native Auth user
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
          },
        },
      });

      if (error) throw error;

      // 2. Try saving to a relational profiles table
      try {
        await supabaseClient.from('profiles').upsert({
          email: email.toLowerCase(),
          name: profileData.name,
          phone: profileData.phone,
          address: JSON.stringify(profileData.address),
          referral_code: profileData.referralCode,
          loyalty_points: 150,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        // Table may not exist yet, we still succeed in signup because of metadata
        console.warn('Could not insert to custom profiles table (table might not exist yet):', dbErr);
      }

      return { success: true, data, isMock: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase authentication failed.' };
    }
  }

  // Fallback / Simulation Mode
  const simulatedProfile: UserProfile = {
    email: email.toLowerCase(),
    name: profileData.name,
    phone: profileData.phone,
    address: profileData.address,
    wishlist: [],
    couponsUsed: [],
    referralCode: profileData.referralCode,
    loyaltyPoints: 150,
  };
  localStorage.setItem(`mock_profile_${email.toLowerCase()}`, JSON.stringify(simulatedProfile));
  return { success: true, isMock: true };
}

/**
 * Real Supabase Sign-In. Fallback to verifying mock users.
 */
export async function signInMember(
  email: string,
  password: string
): Promise<{ success: boolean; profile?: UserProfile; error?: string; isMock?: boolean }> {
  const cleanEmail = email.toLowerCase();

  if (isSupabaseActive() && supabaseClient) {
    try {
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Build profile out of user metadata or database Table
      let profile: UserProfile = {
        email: cleanEmail,
        name: authData.user?.user_metadata?.name || 'Tendai Moyo',
        phone: authData.user?.user_metadata?.phone || '+263776559364',
        address: authData.user?.user_metadata?.address || {
          street: 'Central Avenues',
          city: 'Chinhoyi',
          province: 'Mashonaland West',
        },
        wishlist: [],
        couponsUsed: [],
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000),
        loyaltyPoints: 150,
      };

      try {
        const { data: dbProfile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (dbProfile) {
          const parsedAddress = typeof dbProfile.address === 'string' 
            ? JSON.parse(dbProfile.address) 
            : dbProfile.address;

          profile = {
            email: cleanEmail,
            name: dbProfile.name || profile.name,
            phone: dbProfile.phone || profile.phone,
            address: parsedAddress || profile.address,
            wishlist: dbProfile.wishlist || [],
            couponsUsed: dbProfile.coupons_used || [],
            referralCode: dbProfile.referral_code || profile.referralCode,
            loyaltyPoints: dbProfile.loyalty_points || 150,
          };
        }
      } catch (dbErr) {
        console.warn('Custom profiles table select skipped (using Auth User metadata instead):', dbErr);
      }

      return { success: true, profile, isMock: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase authentication failed.' };
    }
  }

  // Fallback Simulation Mode
  const stored = localStorage.getItem(`mock_profile_${cleanEmail}`);
  if (stored) {
    return { success: true, profile: JSON.parse(stored), isMock: true };
  }

  // Generate generic profile
  const genericProfile: UserProfile = {
    email: cleanEmail,
    name: 'Tendai Moyo (Simulated)',
    phone: '+263776559364',
    address: {
      street: '14 King George Road, Avondale',
      city: 'Harare',
      province: 'Harare Metropolitan',
    },
    wishlist: [],
    couponsUsed: [],
    referralCode: 'VIPREF-7712',
    loyaltyPoints: 320,
  };
  localStorage.setItem(`mock_profile_${cleanEmail}`, JSON.stringify(genericProfile));
  return { success: true, profile: genericProfile, isMock: true };
}

/**
 * Sign out session
 */
export async function signOutMember(): Promise<void> {
  if (isSupabaseActive() && supabaseClient) {
    await supabaseClient.auth.signOut();
  }
}

/**
 * Send Magic Link OTP / Sign-in Link to Email
 */
export async function sendMagicLink(
  email: string,
  isSignUp: boolean,
  profileData?: Omit<UserProfile, 'email' | 'wishlist' | 'couponsUsed' | 'loyaltyPoints'>
): Promise<{ success: boolean; error?: string; isMock?: boolean }> {
  const cleanEmail = email.toLowerCase();
  if (isSupabaseActive() && supabaseClient) {
    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: window.location.origin,
          data: isSignUp && profileData ? {
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
          } : undefined,
        },
      });
      if (error) throw error;
      return { success: true, isMock: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send Magic Link.' };
    }
  }

  // Fallback Simulation Mode
  if (isSignUp && profileData) {
    const simulatedProfile: UserProfile = {
      email: cleanEmail,
      name: profileData.name,
      phone: profileData.phone,
      address: profileData.address,
      wishlist: [],
      couponsUsed: [],
      referralCode: profileData.referralCode,
      loyaltyPoints: 150,
    };
    localStorage.setItem(`mock_profile_${cleanEmail}`, JSON.stringify(simulatedProfile));
  }
  return { success: true, isMock: true };
}

/**
 * Send OTP Code to Phone Number
 */
export async function sendPhoneOTP(
  phone: string,
  isSignUp: boolean,
  profileData?: Omit<UserProfile, 'email' | 'wishlist' | 'couponsUsed' | 'loyaltyPoints'>
): Promise<{ success: boolean; error?: string; isMock?: boolean; simulatedOTP?: string }> {
  if (isSupabaseActive() && supabaseClient) {
    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        phone: phone,
        options: {
          data: isSignUp && profileData ? {
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
          } : undefined,
        },
      });
      if (error) throw error;
      return { success: true, isMock: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send Phone OTP.' };
    }
  }

  // Fallback Simulation Mode: generate a random 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return { success: true, isMock: true, simulatedOTP: code };
}

/**
 * Verify OTP Code for Phone Number
 */
export async function verifyPhoneOTP(
  phone: string,
  token: string,
  isSignUp: boolean,
  profileData?: Partial<UserProfile>
): Promise<{ success: boolean; profile?: UserProfile; error?: string; isMock?: boolean }> {
  if (isSupabaseActive() && supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms',
      });
      if (error) throw error;

      const cleanEmail = data.user?.email || `phone-${phone.replace('+', '')}@vip.co.zw`;
      
      let profile: UserProfile = {
        email: cleanEmail,
        name: data.user?.user_metadata?.name || profileData?.name || 'Tendai Moyo',
        phone: phone,
        address: data.user?.user_metadata?.address || profileData?.address || {
          street: 'Central Avenues',
          city: 'Chinhoyi',
          province: 'Mashonaland West',
        },
        wishlist: [],
        couponsUsed: [],
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000),
        loyaltyPoints: 150,
      };

      try {
        await supabaseClient.from('profiles').upsert({
          email: cleanEmail,
          name: profile.name,
          phone: phone,
          address: JSON.stringify(profile.address),
          referral_code: profile.referralCode,
          loyalty_points: 150,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Custom profiles table upsert skipped during phone OTP verify:', dbErr);
      }

      return { success: true, profile, isMock: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed.' };
    }
  }

  // Fallback Simulation Mode
  const cleanEmail = profileData?.email || `phone-${phone.replace('+', '')}@vip.co.zw`;
  let profile: UserProfile = {
    email: cleanEmail,
    name: profileData?.name || 'Tendai Moyo',
    phone: phone,
    address: profileData?.address || {
      street: 'Central Avenues',
      city: 'Chinhoyi',
      province: 'Mashonaland West',
    },
    wishlist: [],
    couponsUsed: [],
    referralCode: profileData?.referralCode || 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000),
    loyaltyPoints: 150,
  };

  localStorage.setItem(`mock_profile_${cleanEmail}`, JSON.stringify(profile));
  return { success: true, profile, isMock: true };
}

/**
 * Retrieve current active session and profile, if any exists in Supabase Client.
 */
export async function getSessionUserProfile(): Promise<UserProfile | null> {
  if (isSupabaseActive() && supabaseClient) {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error || !session || !session.user) return null;

      const user = session.user;
      const cleanEmail = user.email ? user.email.toLowerCase() : '';
      if (!cleanEmail) return null;

      let profile: UserProfile = {
        email: cleanEmail,
        name: user.user_metadata?.name || 'Tendai Moyo',
        phone: user.user_metadata?.phone || '+263776559364',
        address: user.user_metadata?.address || {
          street: 'Central Avenues',
          city: 'Chinhoyi',
          province: 'Mashonaland West',
        },
        wishlist: [],
        couponsUsed: [],
        referralCode: 'VIPREF-' + Math.floor(Math.random() * 9000 + 1000),
        loyaltyPoints: 150,
      };

      try {
        const { data: dbProfile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (dbProfile) {
          const parsedAddress = typeof dbProfile.address === 'string' 
            ? JSON.parse(dbProfile.address) 
            : dbProfile.address;

          profile = {
            email: cleanEmail,
            name: dbProfile.name || profile.name,
            phone: dbProfile.phone || profile.phone,
            address: parsedAddress || profile.address,
            wishlist: dbProfile.wishlist || [],
            couponsUsed: dbProfile.coupons_used || [],
            referralCode: dbProfile.referral_code || profile.referralCode,
            loyaltyPoints: dbProfile.loyalty_points || 150,
          };
        }
      } catch (dbErr) {
        console.warn('Custom profiles table select skipped (using Auth User metadata instead):', dbErr);
      }

      return profile;
    } catch (err) {
      console.warn('Unsuccessfully reclaimed session user:', err);
      return null;
    }
  }
  return null;
}

/* ==========================================================================
   ORDER HISTORY & SYNC
   ========================================================================== */

/**
 * Sync checkout order to Supabase table
 */
export async function syncOrderToSupabase(order: Order): Promise<boolean> {
  const stored_orders = JSON.parse(localStorage.getItem('vip_orders') || '[]');
  stored_orders.push(order);
  localStorage.setItem('vip_orders', JSON.stringify(stored_orders));

  if (isSupabaseActive() && supabaseClient) {
    try {
      const { error } = await supabaseClient.from('orders').insert({
        id: order.id,
        customer_email: order.customerEmail.toLowerCase(),
        customer_name: order.customerName,
        payment_phone: order.paymentPhone,
        shipping_address: JSON.stringify(order.shippingAddress),
        items: JSON.stringify(order.items),
        subtotal: order.subtotal,
        shipping_cost: order.shippingCost,
        total: order.total,
        payment_method: order.paymentMethod,
        status: order.status,
        date: order.date,
        tracking_number: order.trackingNumber,
        discount_used: order.discountUsed,
        source: 'Supabase Sync Engine',
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Could not sync order event to Supabase: ', err);
      return false;
    }
  }
  return true;
}

/**
 * Retrieve user order history
 */
export async function fetchUserOrders(email: string): Promise<Order[]> {
  const fallback_orders = JSON.parse(localStorage.getItem('vip_orders') || '[]');
  const filtered_fallback = fallback_orders.filter(
    (o: any) => o.customerEmail?.toLowerCase() === email.toLowerCase()
  );

  if (isSupabaseActive() && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('customer_email', email.toLowerCase());

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d: any) => {
          const parsedItems = typeof d.items === 'string' ? JSON.parse(d.items) : d.items;
          const parsedAddress = typeof d.shipping_address === 'string' 
            ? JSON.parse(d.shipping_address) 
            : (typeof d.address === 'string' ? JSON.parse(d.address) : (d.shipping_address || d.address));
          
          return {
            id: d.id,
            customerEmail: d.customer_email,
            customerName: d.customer_name,
            items: parsedItems,
            subtotal: Number(d.subtotal),
            shippingCost: Number(d.shipping_cost ?? d.shippingCost ?? 0.0),
            total: Number(d.total),
            paymentMethod: d.payment_method || d.paymentMethod || 'Cash',
            paymentPhone: d.payment_phone || d.paymentPhone,
            status: d.status,
            shippingAddress: parsedAddress,
            trackingNumber: d.tracking_number || d.trackingNumber || 'TRACK-' + Math.floor(Math.random() * 9000 + 1000),
            date: d.date,
            discountUsed: Number(d.discount_used ?? d.discountUsed ?? 0.5),
          } as Order;
        });
      }
    } catch (err) {
      console.warn('Fetch order history query fallback to local cache:', err);
    }
  }

  return filtered_fallback;
}

/* ==========================================================================
   WISHLIST SYNC
   ========================================================================== */

/**
 * Sync wishlist to profile
 */
export async function syncWishlist(email: string, wishlist: string[]): Promise<void> {
  const stored = localStorage.getItem(`mock_profile_${email.toLowerCase()}`);
  if (stored) {
    const profile = JSON.parse(stored);
    profile.wishlist = wishlist;
    localStorage.setItem(`mock_profile_${email.toLowerCase()}`, JSON.stringify(profile));
  }

  if (isSupabaseActive() && supabaseClient) {
    try {
      await supabaseClient
        .from('profiles')
        .update({ wishlist, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase());
    } catch (err) {
      console.warn('Could not sync wishlist state to Supabase:', err);
    }
  }
}
