'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/auth';

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  cost: z.coerce.number().min(0, 'Cost must be positive'),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  sku: z.string().optional().nullable(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.string().uuid('Invalid category'),
  supplier: z.string().optional().nullable(),
  discountPercent: z.coerce.number().nullable().optional(),
  isActive: z.boolean().default(true),
  specsJson: z.string(),
});

export async function upsertProduct(payload: unknown) {
  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    await requireAdminAuth();
  } catch (e: any) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    JSON.parse(parsed.data.specsJson);
  } catch (e) {
    return { success: false, error: 'Internal Error: Invalid specifications JSON payload.' };
  }

  const { id, ...data } = parsed.data;

  try {
    if (id) {
       await prisma.product.update({ where: { id }, data });
    } else {
       await prisma.product.create({ data });
    }
  } catch (e: any) {
    return { success: false, error: 'Database upsert failed: ' + e.message };
  }
  
  revalidatePath('/admin/products');
  revalidatePath('/catalog', 'layout');
  
  return { success: true };
}
