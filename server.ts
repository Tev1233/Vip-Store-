/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import adminApi from './server/adminApi';
import { dbStore } from './server/dbStore';
import { renderAdminLoginPage } from './server/loginPage';

// Load environment configurations
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Register Gated Admin APIs
app.use('/api/admin', adminApi);

// Gated security route for Admin Dashboard Panel (Ensures Total Isolation)
app.get(['/admin', '/admin.html'], (req, res, next) => {
  const token = req.headers.cookie?.split('; ')
    .find(row => row.startsWith('admin_token='))
    ?.split('=')[1];

  const user = token ? dbStore.verifyRole(token, ['ADMIN', 'SUPPORT']) : null;

  if (user) {
    // If authenticated, serve the core React dynamic bundle
    if (process.env.NODE_ENV !== 'production') {
      req.url = '/admin.html';
      next(); // Falls through to Vite middleware
    } else {
      res.sendFile(path.join(process.cwd(), 'dist/admin.html'));
    }
  } else {
    // Serving high-fidelity secure brand sign-in portal directly from the server
    res.send(renderAdminLoginPage());
  }
});

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== 'MY_GEMINI_API_KEY' && API_KEY.trim() !== '') {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI integrated successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini Client: ', err);
  }
} else {
  console.log('Gemini API key is missing or default. App will use smart luxury rules engine.');
}

// ----------------------------------------------------
// Supabase Public Config Endpoint
// ----------------------------------------------------
app.get('/api/supabase-config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null
  });
});

// ----------------------------------------------------
// Smart Stylist API Endpoint
// ----------------------------------------------------
app.post('/api/stylist', async (req, res) => {
  const { mood, occasion, budget, category, currentItems } = req.body;

  const userContextPrompt = `
    You are the Elite VIP Fashion Stylist based in Chinhoyi, Zimbabwe. 
    A premium customer wants advice.
    Occasion/Category requested: ${occasion || 'Casual Street Style'}
    Desired Vibe/Mood: ${mood || 'Luxury Elegant'}
    Max Budget / Limit: USD ${budget ? `$${budget}` : 'Unlimited'}
    Preferred Item Category: ${category || 'All Luxury'}
    
    Here is the catalog of currently available VIP Store products in stock:
    ${JSON.stringify(currentItems || [])}

    Write a high-end customized styling response in markdown. Maintain a luxurious, professional, helpful tone. Include:
    1. A stylish personalgreeting (reference Chinhoyi, Bulawayo, or Zimbabwe's current sunny/cool seasons where appropriate).
    2. Curated product pairing recommendations from the listed inventory that fit their profile.
    3. Practical styling tips (e.g., how to accessorize with gold jewelry, layering with bags/shades, appropriate shoe combinations for Zimbabwean streets).
    4. Keep it concise, classy, and highly structured with bullet points.
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userContextPrompt,
        config: {
          systemInstruction: 'You are a professional luxury fashion consultant for VIP Store, Zimbabwe. You focus on premium elegance, affordable quality, local context, and tailored styling setups.',
          temperature: 0.7,
        }
      });

      return res.json({ 
        success: true, 
        advice: response.text || 'Unable to parse adviser feedback.',
        source: 'Gemini AI Model'
      });
    } catch (err: any) {
      console.error('Error with Gemini call: ', err);
      // Fallback inside error handler
    }
  }

  // Smart luxury engine fallback if no API key or if model errors out
  const welcomeQuotes = [
    `Welcome to the VIP Stylist portal. Enjoy premium styling recommendations optimized for your lifestyle in Chinhoyi, Bulawayo & nationwide.`,
    `Greetings! Step into luxury. Let's elevate your wardrobe with high-contrast elements tailored for contemporary Zimbabwean style.`
  ];

  const adviceText = `
### ✨ VIP Personal Stylist Selection (Smart Rule Engine)

${welcomeQuotes[Math.floor(Math.random() * welcomeQuotes.length)]}

---

#### 🌟 1. Elite Curated Pairings

For a **${mood || 'Premium Luxury'}** look on **${occasion || 'Daily Luxury Wear'}**, we recommend pairing:
*   **A Solid Core Layer**: The *Bespoke Suede Bomber Jacket* or *VIP Heavyweight Hoodie* provides a structural, premium silhouette that holds shape perfectly.
*   **The Signature Statement Piece**: Pair with the *VIP Chrono Gold Mechanical Watch*. A polished gold accent creates a focal point of absolute luxury.
*   **The Base Foundation**: Balance with breathable footwear like our *Hyper-Stride Knit Sneakers* for daytime street versatility or *Aventador Hand-Stitched Loafers* for evening executive status.

---

#### 📍 2. Local Zimbabwe Styling Advice
*   **The Sun Guard**: Zimbabwe averages 8+ hours of radiant sunshine. Polarized protective accessories like our *Metropolitan Gold Aviator Sunglasses* are non-negotiable—both to guard your vision and frame your jawline elegantly.
*   **The Airflow Secret**: Opt for lightweight bases. Items crafted with bamboo or premium flax-linen are essential for staying crisp, dry, and cool.
*   **Gold Contrast Accentuation**: To play into the "VIP Gold" identity, incorporate subtle gold metal hardware (buckles, watch dials, bag zipper linings) to contrast with solid black or deep navy base cloths.

---
_Note: Configure your \`GEMINI_API_KEY\` in your Settings panel to enable dynamic real-time AI styling predictions._
  `;

  return res.json({
    success: true,
    advice: adviceText.trim(),
    source: 'Smart Rule Fallback Engine'
  });
});

// ----------------------------------------------------
// Dev or Production Build serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite middleware after API routes
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VIP Server] is running securely on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
