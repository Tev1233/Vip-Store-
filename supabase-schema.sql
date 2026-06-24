-- Supabase SQL Schema & Strict Row-Level Security (RLS) Policies Setup Script
-- Designed for secure, client-facing e-commerce in emergings markets.

-- 1. Setup Custom Roles and Enums
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'SUPPORT', 'ADMIN');

-- 2. Create Public Profiles Table
-- Linked directly to Supabase auth.users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address JSONB,
    wishlist TEXT[] DEFAULT '{}',
    coupons_used TEXT[] DEFAULT '{}',
    referral_code TEXT UNIQUE,
    loyalty_points INTEGER DEFAULT 150 NOT NULL,
    role user_role DEFAULT 'CUSTOMER' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Products Table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    images TEXT[] NOT NULL,
    sizes TEXT[] NOT NULL,
    colors TEXT[] NOT NULL,
    stock INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Orders Table
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    items JSONB NOT NULL, -- Detailed clothing item specs & sizes
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_cost NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    shipping_address JSONB NOT NULL,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. Strict RLS Policies for Profiles Table
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile fields
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Support and Admin users can view all profiles
CREATE POLICY "Privileged roles can view all profiles" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('SUPPORT', 'ADMIN')
        )
    );

-- 7. Strict RLS Policies for Products Table
-- Public Read access allowed
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT
    USING (true);

-- Admin write access only
CREATE POLICY "Only admins can insert products" ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can update products" ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can delete products" ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- 8. Strict RLS Policies for Orders Table
-- Customers can insert their own orders (enforces user_id matches active auth.uid())
CREATE POLICY "Users can place orders for themselves" ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Customers can view only their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Support and Admin users can view all orders
CREATE POLICY "Privileged roles can view all orders" ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('SUPPORT', 'ADMIN')
        )
    );

-- Support and Admin users can update order status
CREATE POLICY "Privileged roles can update orders" ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('SUPPORT', 'ADMIN')
        )
    );

-- 9. Automatic Public Profile Trigger on Auth User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, phone, referral_code, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        'VIPREF-' || floor(random() * 9000 + 1000)::text,
        'CUSTOMER'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
