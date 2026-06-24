# Next.js Server Actions with Prisma & Zod

Below is the complete, compiled, and typed server action controller code ready to be used in your Next.js e-commerce app router.

Place this in `src/app/actions/productActions.ts` (or similar actions directory):

```typescript
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const prisma = new PrismaClient();

// Define input validation schemas using Zod
const ProductCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').regex(/^[A-Z0-9-]+$/, 'SKU must be alphanumeric (can contain hyphens)'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().positive('Price must be a positive number'),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
  isActive: z.boolean().default(true),
});

const ProductUpdateSchema = ProductCreateSchema.partial();

// Helper to check for ADMIN or SUPPORT role
async function verifyAdminRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
    throw new Error('UNAUTHORIZED: Admin or Support privileges required.');
  }

  return user;
}

// ----------------------------------------------------
// CREATE PRODUCT ACTION
// ----------------------------------------------------
export async function createProductAction(userId: string, formData: unknown) {
  try {
    // 1. Authenticate and authorize checks on Server
    await verifyAdminRole(userId);

    // 2. Validate input format fully on server
    const parsed = ProductCreateSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
      };
    }

    const { name, sku, description, price, stock, isActive } = parsed.data;

    // 3. Generate a clean URL-friendly slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 4. Transform price (decimal) to cents (integer) before mutating
    const priceInCents = Math.round(price * 100);

    // 5. Database check for duplicate SKU or slug
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });
    if (existingSku) {
      return { success: false, error: 'Product SKU must be completely unique.' };
    }

    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return { success: false, error: 'Product slug already exists. Please choose a different title.' };
    }

    // 6. DB mutation
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        slug,
        description,
        price: priceInCents,
        stock,
        isActive,
      },
    });

    revalidatePath('/admin/inventory');
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || 'Server error occurred during product insertion.' };
  }
}

// ----------------------------------------------------
// UPDATE PRODUCT ACTION
// ----------------------------------------------------
export async function updateProductAction(userId: string, productId: string, formData: unknown) {
  try {
    // 1. Auth check
    await verifyAdminRole(userId);

    // 2. Validate input partial
    const parsed = ProductUpdateSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
      };
    }

    // Prepare data
    const updateData: any = { ...parsed.data };

    // Handle price convert if price is present
    if (parsed.data.price !== undefined) {
      updateData.price = Math.round(parsed.data.price * 100);
    }

    // Handle slug auto-generate if name is being changed
    if (parsed.data.name !== undefined) {
      updateData.slug = parsed.data.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Check SKU Unique constraints if changing SKU
    if (parsed.data.sku !== undefined) {
      const existingSku = await prisma.product.findFirst({
        where: { 
          sku: parsed.data.sku,
          id: { not: productId }
        },
      });
      if (existingSku) {
        return { success: false, error: 'Target SKU conflicts with another active product.' };
      }
    }

    // 3. Save updates to PostgreSQL via Prisma
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    revalidatePath('/admin/inventory');
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || 'Database update failure.' };
  }
}

// ----------------------------------------------------
// DELETE PRODUCT ACTION
// ----------------------------------------------------
export async function deleteProductAction(userId: string, productId: string) {
  try {
    // 1. Role Authorization Checks - Admin or Support (Only Admin might be allowed for hard deletes)
    const user = await verifyAdminRole(userId);
    if (user.role !== 'ADMIN') {
      return { success: false, error: 'FORBIDDEN: Only full ADMIN role can delete catalogue records.' };
    }

    // 2. Ensure product exists before deleting
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: 'No product with the matching ID exists in the database.' };
    }

    // 3. Mutate DB
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/admin/inventory');
    return { success: true, message: `Product "${product.name}" successfully deleted.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Server error occurred during database deletions.' };
  }
}
```
