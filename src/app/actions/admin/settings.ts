'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/auth';

const storeSettingsSchema = z.object({
  id: z.string(),
  storeName: z.string().min(1, 'Store Name is required'),
  contactEmail: z.string().email('Invalid email').optional().nullable(),
  taxRate: z.coerce.number().min(0).max(100).transform(val => val / 100), // UX passes 25, transform makes it 0.25
  defaultCurrency: z.string().min(1),
  timezone: z.string().min(1),
  notifyNewOrder: z.boolean(),
  notifyLowStock: z.boolean()
});

export async function updateStoreSettings(payload: unknown) {
  const parsed = storeSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, ...data } = parsed.data;

  try {
    await requireAdminAuth();
  } catch (e: any) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.storeSettings.update({
      where: { id },
      data
    });
  } catch (e: any) {
    return { success: false, error: 'Failed to update Store Settings: ' + e.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/checkout');
  return { success: true };
}

const shippingMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  estimatedDays: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  storeSettingsId: z.string().uuid()
});

export async function upsertShippingMethod(payload: unknown) {
  const parsed = shippingMethodSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, ...data } = parsed.data;

  try {
    await requireAdminAuth();
  } catch (e: any) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    if (id) {
      await prisma.shippingMethod.update({ where: { id }, data });
    } else {
      await prisma.shippingMethod.create({ data });
    }
  } catch (e: any) {
    return { success: false, error: 'Database upsert failed: ' + e.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/checkout');
  return { success: true };
}

export async function deleteShippingMethod(id: string) {
  try {
    await requireAdminAuth();
  } catch (e: any) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.shippingMethod.delete({ where: { id } });
  } catch (e: any) {
    return { success: false, error: 'Failed to clear Shipping Method: ' + e.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/checkout');
  return { success: true };
}
