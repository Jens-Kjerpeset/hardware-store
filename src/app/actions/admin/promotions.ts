'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/auth';

const promotionSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, 'Code must be at least 3 characters'),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountPercent: z.coerce.number().nullable().optional(),
  discountAmount: z.coerce.number().nullable().optional(),
  isActive: z.boolean().default(true),
  maxUses: z.coerce.number().int().min(1).nullable().optional(),
  minOrderValue: z.coerce.number().min(0).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  applicableCategoryIds: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.discountType === 'PERCENTAGE') {
    if (data.discountPercent === undefined || data.discountPercent === null || data.discountPercent <= 0 || data.discountPercent > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid percentage (1-100) is required for PERCENTAGE type.',
        path: ['discountPercent']
      });
    }
  } else if (data.discountType === 'FIXED') {
    if (data.discountAmount === undefined || data.discountAmount === null || data.discountAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid amount is required for FIXED type.',
        path: ['discountAmount']
      });
    }
  }
});

export async function upsertPromotion(payload: unknown) {
  const parsed = promotionSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await requireAdminAuth();
  } catch (e: any) {
    return { success: false, error: 'Unauthorized' };
  }

  const { id, code, discountType, ...rest } = parsed.data;
  
  const normalizedCode = code.toUpperCase().trim();
  const expiresAtDate = rest.expiresAt ? new Date(rest.expiresAt) : null;

  const dataToSave = {
    code: normalizedCode,
    discountType,
    discountPercent: discountType === 'PERCENTAGE' ? rest.discountPercent ?? null : null,
    discountAmount: discountType === 'FIXED' ? rest.discountAmount ?? null : null,
    isActive: rest.isActive,
    maxUses: Number.isNaN(rest.maxUses) || !rest.maxUses ? null : rest.maxUses,
    minOrderValue: Number.isNaN(rest.minOrderValue) || !rest.minOrderValue ? null : rest.minOrderValue,
    expiresAt: expiresAtDate,
    applicableCategoryIds: rest.applicableCategoryIds?.trim() || null,
  };

  try {
    if (id) {
       await prisma.discountCode.update({ where: { id }, data: dataToSave });
    } else {
       // Catch code duplication
       const existing = await prisma.discountCode.findUnique({ where: { code: normalizedCode }});
       if (existing) {
         return { success: false, error: 'A promotion with this code already exists.' };
       }
       await prisma.discountCode.create({ data: dataToSave });
    }
  } catch (e: any) {
    return { success: false, error: 'Database upsert failed: ' + e.message };
  }
  
  revalidatePath('/admin/promotions');
  revalidatePath('/checkout');
  
  return { success: true };
}
