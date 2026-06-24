/**
 * Isolated Admin API Router with strict RBAC checking & state verification
 * File: /server/adminApi.ts
 */

import { Router, Request, Response, NextFunction } from 'express';
import { dbStore } from './dbStore';

const router = Router();

// ----------------------------------------------------
// Security Middleware: Strict RBAC Gating
// ----------------------------------------------------
function adminSupportGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const sessionCookie = req.headers.cookie?.split('; ')
    .find(row => row.startsWith('admin_token='))
    ?.split('=')[1];

  const token = authHeader?.replace('Bearer ', '') || sessionCookie;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'UNAUTHORIZED: Security credentials are missing.' 
    });
  }

  // Validate session against database and check if role is ADMIN or SUPPORT
  const user = dbStore.verifyRole(token, ['ADMIN', 'SUPPORT']);
  if (!user) {
    return res.status(403).json({ 
      success: false, 
      error: 'FORBIDDEN: Access denied. Only authorized ADMIN or SUPPORT roles allowed.' 
    });
  }

  // Bind authenticated user metadata to request
  req.body._authenticatedUser = user;
  next();
}

// ----------------------------------------------------
// Admin & Support authentication login session agent
// ----------------------------------------------------
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const user = dbStore.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid logins. Access denied.' });
  }

  // Simulation: Password check (Admin -> admin123, Support -> support123)
  const isPassValid = 
    (user.role === 'ADMIN' && password === 'admin123') ||
    (user.role === 'SUPPORT' && password === 'support123') ||
    (user.role === 'CUSTOMER' && password === 'customer123');

  if (!isPassValid) {
    return res.status(401).json({ success: false, error: 'Invalid password. Please retry.' });
  }

  // Role Gate check - Only ADMIN and SUPPORT allowed
  if (user.role !== 'ADMIN' && user.role !== 'SUPPORT') {
    return res.status(403).json({ 
      success: false, 
      error: 'FORBIDDEN: Regular customer accounts cannot download or access administrative tools.' 
    });
  }

  // Send back secure token cookie
  res.cookie('admin_token', user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
  });

  return res.json({
    success: true,
    message: 'Authentication successful.',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: user.token,
    }
  });
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('admin_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Profile endpoint
router.get('/me', (req: Request, res: Response) => {
  const sessionCookie = req.headers.cookie?.split('; ')
    .find(row => row.startsWith('admin_token='))
    ?.split('=')[1];

  if (!sessionCookie) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  const user = dbStore.getUserByToken(sessionCookie);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
    return res.status(401).json({ success: false, error: 'Unauthorized credentials.' });
  }

  return res.json({ success: true, user });
});

// ----------------------------------------------------
// Inventory Query List Route - Paginated
// ----------------------------------------------------
router.get('/products', adminSupportGuard, (req: Request, res: Response) => {
  const search = String(req.query.search || '');
  const page = parseInt(String(req.query.page || '1'), 10);
  const limit = parseInt(String(req.query.limit || '5'), 10);

  const result = dbStore.queryProducts(search, page, limit);
  return res.json({
    success: true,
    ...result
  });
});

// ----------------------------------------------------
// Create Product with Strict Server-Side Validation
// ----------------------------------------------------
router.post('/products', adminSupportGuard, (req: Request, res: Response) => {
  const { name, sku, description, price, stock, category, images } = req.body;

  // 1. Validations
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Server validation: Valid product title (min 2 chars) is required.' });
  }
  if (!sku || typeof sku !== 'string' || sku.trim().length < 3 || !/^[A-Z0-9-]+$/.test(sku)) {
    return res.status(400).json({ success: false, error: 'Server validation: Valid alphanumeric SKU (min 3 chars) is required.' });
  }
  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Server validation: Product description must be at least 5 characters.' });
  }
  if (price === undefined || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ success: false, error: 'Server validation: Price must be a positive number.' });
  }
  if (stock === undefined || typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ success: false, error: 'Server validation: Stock must be a non-negative integer.' });
  }

  try {
    // Convert normal decimal price (e.g. 29.99) to cents (2999) before database mutate
    const priceInCents = Math.round(price * 100);

    const product = dbStore.createProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      description: description.trim(),
      price: priceInCents,
      stock,
      category: category || 'Shirts',
      images: images || [],
    });

    return res.status(201).json({
      success: true,
      message: `Product "${product.name}" registered successfully.`,
      product,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Update Inventory status / toggle switch / pricing
// ----------------------------------------------------
router.patch('/products/:id', adminSupportGuard, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sku, description, price, stock, isActive, category, images } = req.body;

  const updates: any = {};

  if (isActive !== undefined) {
    updates.isActive = Boolean(isActive);
  }

  if (stock !== undefined) {
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ success: false, error: 'Stock must be a non-negative integer.' });
    }
    updates.stock = stock;
  }

  if (price !== undefined) {
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, error: 'Price must be a valid positive number.' });
    }
    // Transform price decimal input to cents
    updates.price = Math.round(price * 100);
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
    }
    updates.name = name.trim();
  }

  if (sku !== undefined) {
    if (typeof sku !== 'string' || sku.trim().length < 3 || !/^[A-Z0-9-]+$/.test(sku)) {
      return res.status(400).json({ success: false, error: 'SKU must be alphanumeric (min 3 chars).' });
    }
    updates.sku = sku.trim().toUpperCase();
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Description must be at least 5 characters.' });
    }
    updates.description = description.trim();
  }

  if (category !== undefined) {
    updates.category = category;
  }

  if (images !== undefined) {
    updates.images = images;
  }

  try {
    const updated = dbStore.updateProduct(id, updates);
    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Delete Product (ADMIN only hard delete guard)
// ----------------------------------------------------
router.delete('/products/:id', adminSupportGuard, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.body._authenticatedUser;

  // Extra verification: Only full ADMIN role can perform hard deletions of catalogue records
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      error: 'FORBIDDEN: Only members with full ADMIN role rights can delete products from inventory.' 
    });
  }

  try {
    const { name } = dbStore.deleteProduct(id);
    return res.json({
      success: true,
      message: `Product "${name}" successfully deleted from active database.`
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
