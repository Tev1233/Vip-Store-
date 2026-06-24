/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Database, Cpu, ShieldCheck, Zap, Sparkles, X, ChevronRight, Code } from 'lucide-react';

interface DocPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocPortal({ isOpen, onClose }: DocPortalProps) {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'workflows' | 'zimbabwe' | 'deployment'>('architecture');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="doc-portal-backdrop" className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
        <motion.div
          id="doc-portal-sheet"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-4xl h-full bg-neutral-950 text-white border-l border-amber-500/30 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-900 bg-neutral-950 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <BookOpen className="h-5 w-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  VIP Market Architecture <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">ZIM Launch Core</span>
                </h2>
                <p className="text-xs text-neutral-400">Spec sheet for 100k+ products, 1M+ monthly users, offline-resilience and EcoCash integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-900 rounded-full border border-neutral-800 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          {/* Navigation Tab Controls */}
          <div className="flex border-b border-neutral-900 bg-neutral-950/70 overflow-x-auto scrollbar-none">
            {[
              { id: 'architecture', label: 'Architecture & Folders', icon: Cpu },
              { id: 'database', label: 'Postgres & Supabase Schema', icon: Database },
              { id: 'workflows', label: 'Fulfillment & Checkout', icon: Code },
              { id: 'zimbabwe', label: 'Zimbabwe 3G/4G Tweaks', icon: Zap },
              { id: 'deployment', label: 'Deployment & Security', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-amber-500 text-amber-400 bg-neutral-900/40'
                      : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents - Scrollable */}
          <div className="flex-1 p-8 overflow-y-auto space-y-6 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-neutral-800">
            {activeTab === 'architecture' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">1. Client-Server Architecture Diagram</h3>
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-300 overflow-x-auto whitespace-pre">
{`                  [Zimbabwe Client: 3G Mobile App / Web Widget]
                                       │
                                       ▼ (SSL / HTTPS)
       [Cloudflare CDN Edge: Chinhoyi IP Static Cache / HTTP/2 Pooling]
                                       │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
     [Vite/Next.js UI Server Core]          [EcoCash & InnBucks USSD API]
                       │                               │
                       ▼                               ▼
       [Express TS Proxy Server] <──────────> [Supabase Backend API]
                       │                               │
                       ▼                               ▼
           [Gemini LLM model]               [PostgreSQL Database Clusters]
        (Stylist Recommendation)           (Row-Level Security / Indexes)`}
                  </div>
                </div>

                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">2. Modular Folder Structure</h3>
                  <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-lg text-xs font-mono">
                    <ul className="space-y-1 text-neutral-300">
                      <li>📂 <span className="text-white font-bold">vip-market-core</span></li>
                      <li>├── 📂 <span className="text-neutral-400">.github/workflows</span> — Automated CI/CD Lint & Cloud Run deploy</li>
                      <li>├── 📂 <span className="text-neutral-400">server</span> — Full-stack entry & Gemini backend styling engines</li>
                      <li>│   ├── 📄 <span className="text-neutral-500">server.ts</span> — Express backend core</li>
                      <li>│   └── 📄 <span className="text-neutral-500">ussd-callback.ts</span> — Mobile wallet API listener</li>
                      <li>├── 📂 <span className="text-neutral-400">src</span> — Frontend application entry</li>
                      <li>│   ├── 📂 <span className="text-neutral-400">components</span> — Atomized UI widgets</li>
                      <li>│   │   ├── 📄 <span className="text-amber-300">DocPortal.tsx</span> — Technical architecture sheet</li>
                      <li>│   │   ├── 📄 <span className="text-neutral-400">AdminPanel.tsx</span> — Inventory/orders dashboard</li>
                      <li>│   │   └── 📄 <span className="text-neutral-400">Navbar.tsx</span> — Desktop & responsive headers</li>
                      <li>│   ├── 📄 <span className="text-neutral-400">App.tsx</span> — Root state router</li>
                      <li>│   ├── 📄 <span className="text-neutral-400">data.ts</span> — Zimbabwean towns, collections, catalog indexes</li>
                      <li>│   └── 📄 <span className="text-amber-300">types.ts</span> — Strong TypeScript interface signatures</li>
                      <li>├── 📄 <span className="text-neutral-400">tsconfig.json</span> — strict typescript compilation params</li>
                      <li>└── 📄 <span className="text-neutral-400">package.json</span> — fast bundler scripts</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">3. UI/UX Wireframe & Design System</h3>
                  <ul className="space-y-2 text-neutral-400 list-disc pl-5">
                    <li><strong className="text-white">Mobile View Drawer Nav:</strong> Standard Shein style bottom navbar (Home, Browse Categories, Cart, Saved, Profile). High-density grid display designed for fast vertical scrolls.</li>
                    <li><strong className="text-white">Image Density Control:</strong> Responsive grids serving ultra-low quality compressed Avif/WebP formats by default.</li>
                    <li><strong className="text-white">Interactive Sizing Slider:</strong> Fits multiple viewport configurations (from low-end 720p Androids upwards).</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'database' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">Supabase PostgreSQL Schema (Production DDL)</h3>
                  <p className="text-xs text-neutral-400 mb-2">Optimized with Row Level Security (RLS) and custom indices on tracking fields:</p>
                  <pre className="p-4 bg-neutral-950 border border-neutral-900 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre">
{`-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER STORES (SUPABASE-AUTH DELEGATED)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  province_city TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  category TEXT NOT NULL,
  sizes TEXT[] NOT NULL,
  colors TEXT[] NOT NULL,
  images TEXT[] NOT NULL,
  stock_level INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMBINED ORDER SCHEDULING
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'EcoCash', 'InnBucks', 'OneMoney'
  payment_status TEXT DEFAULT 'Pending',
  fulfillment_status TEXT DEFAULT 'Pending', -- 'Shipped', 'Delivered'
  tracking_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can only view their own orders" 
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- DATABASE INDEXING FOR ACCELERATED SEARCH
CREATE INDEX idx_products_category ON public.products (category);
CREATE INDEX idx_orders_customer_phone ON public.orders (customer_phone);
CREATE INDEX idx_products_search ON public.products USING gin(to_tsvector('english', name || ' ' || description));`}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'workflows' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">1. Local Mobile Wallet Payment Flow (EcoCash/OneMoney)</h3>
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs leading-relaxed">
                    <ol className="list-decimal pl-5 space-y-2 text-neutral-300">
                      <li><strong>Customer Enters Phone:</strong> Customer selects EcoCash/OneMoney option and inputs mobile number (+26377... or +26371...).</li>
                      <li><strong>Automated USSD Trigger:</strong> Server sends push payload request to local gateway (Paynow/DirectPay).</li>
                      <li><strong>Secure PIN Dialog:</strong> User sees automated full-screen USSD secure PIN prompt immediately on their handset.</li>
                      <li><strong>Background Callback:</strong> Zimbabwe cellular networks (Econet / NetOne) verify PIN and send static JSON confirmation webhook to our `/api/payments/callback` route.</li>
                      <li><strong>Instant Fulfillment:</strong> App triggers real-time state change, updates local storage order state, and sends SMS tracking key.</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">2. Zimbabwe Shipping & Delivery Rules</h3>
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300">
                    <p className="mb-2"><strong>Tiered Dispatch Schedule:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Chinhoyi Metropolitan (Local HQ):</strong> Next-day standard runner courier (Flat rate USD $2.00). Express same-day courier (USD $3.50).</li>
                      <li><strong>Bulawayo, Gweru, Mutare, Kwekwe Line:</strong> Handed over to overnight transport run (USD $4.50). Transit time is 2-3 calendar days.</li>
                      <li><strong>Victoria Falls, Beitbridge Outposts:</strong> Sent via secure courier partners like Swift / FedEx (USD $5.00 - $7.00). Invoiced with secure tracking keys.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">3. Automated SMS & WhatsApp Ordering Fallback</h3>
                  <p className="text-neutral-400 text-xs">
                    Since data bundles in Zimbabwe can be expensive, the checkout flows feature a <span className="text-emerald-400 font-bold">"WhatsApp Confirm & Order"</span> secondary loop. This formats their entire dynamic shopping cart into a compact text string and generates a one-click WhatsApp API redirect link. This uses zero active data if the client has a social-only chat bundle!
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'zimbabwe' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-neutral-900 border border-amber-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-amber-400" />
                      <h4 className="font-bold text-white text-sm">Low-Bandwidth Mobile Adjustments</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-400 list-disc pl-4">
                      <li><strong className="text-white">Image Scaling:</strong> Auto-serves compressed WebP versions resized down to exact display widths.</li>
                      <li><strong className="text-white">Offline Sync:</strong> Active product catalog indices, items added to cart, and wishlist states are cached in the client`s browser standard `localStorage`. If 3G drops, they can still write orders and search locally.</li>
                      <li><strong className="text-white">Pre-Bundled CSS:</strong> Tailored purely with lightweight Tailwind 4 utilities. Zero massive external UI styles imported.</li>
                    </ul>
                  </div>

                  <div className="p-5 bg-neutral-900 border border-amber-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="h-5 w-5 text-amber-400" />
                      <h4 className="font-bold text-white text-sm">Low-End Android Optimizations</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-400 list-disc pl-4">
                      <li><strong className="text-white">Render Efficiency:</strong> Heavy computational transitions on Framer Motion are disabled for viewports below 640px wide to prevent frame drops.</li>
                      <li><strong className="text-white">Modular Lazy Hydration:</strong> Dynamic interactive tables and invoice generation are loaded asynchronously only when requested.</li>
                      <li><strong className="text-white">Static SVG Symbols:</strong> Custom pure SVGs instead of massive high-resolution canvas drawings.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'deployment' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">1. CI/CD Pipeline & High Availability Recommendations</h3>
                  <p className="text-neutral-400 text-xs mb-3">For managing 1,000,000+ monthly visits and seamless scaling, we recommend the following deployment configurations:</p>
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-3">
                    <p className="text-white font-semibold">🔹 Hosting Infrastructure:</p>
                    <ul className="list-disc pl-5 text-neutral-300 space-y-1">
                      <li>Deploy client-side Vite/Next.js layers to **Vercel Edge** or **Cloud Run Edge Containers** to satisfy ultra-low TTL requirements.</li>
                      <li>Deploy database to multi-zone **Supabase Enterprise** featuring active read-replicas inside Africa South regions (Johannesburg) for Sub-50ms latency in Zimbabwe.</li>
                    </ul>
                    <p className="text-white font-semibold">🔹 Automatic CI/CD Pipeline (GitHub Actions File):</p>
                    <pre className="p-3 bg-neutral-950 rounded text-[10px] text-zinc-400 overflow-x-auto whitespace-pre">
{`name: Deploy VIP Store Main
on:
  push:
    branches: [ main ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 19
      - name: Install & Test
        run: |
          npm ci
          npm run lint
          npm run build`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-amber-400 text-lg font-bold mb-2">2. Mandatory Security Protocol</h3>
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-2 text-neutral-300">
                    <p><strong className="text-white">Data Cryptography:</strong> All payment payload details transmitted inside SSL handshake environments with strict transport security protocols configured at DNS levels.</p>
                    <p><strong className="text-white">Rate Limits:</strong> Limit maximum API interaction requests to `/api/stylist` and `/api/payments` to 10 requests per minute from a single IP signature to prevent denial of service.</p>
                    <p><strong className="text-white">Cross Object Injection Protection:</strong> Strict sanitization of product specifications, user names, and telephone details before compilation to prevent SQL/XSS injections.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-900 bg-neutral-950 flex justify-between items-center text-xs text-neutral-500">
            <span>VIP Store Architecture System • v1.1</span>
            <span className="flex items-center gap-1 text-amber-500">
              <Sparkles className="h-3.5 w-3.5" /> High Performance
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
