'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/auth';

const statusSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['status', 'shippingStatus']),
  value: z.string().min(1),
});

export async function updateOrderStatus(orderId: string, type: 'status' | 'shippingStatus', value: string) {
  const result = statusSchema.safeParse({ id: orderId, type, value });
  
  if (!result.success) {
    return { success: false, error: 'Invalid payload' };
  }

  try {
    await requireAdminAuth();
    
    const dataToUpdate = type === 'status' 
      ? { status: result.data.value } 
      : { shippingStatus: result.data.value };

    await prisma.order.update({
      where: { id: result.data.id },
      data: dataToUpdate,
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${result.data.id}`);
    
    return { success: true };
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return { success: false, error: 'Unauthorized' };
    }
    return { success: false, error: 'Database update failed' };
  }
}

const trackingSchema = z.object({
  id: z.string().uuid(),
  trackingNumber: z.string().optional().default(''),
});

export async function updateTrackingNumber(orderId: string, trackingNumber: string) {
  const result = trackingSchema.safeParse({ id: orderId, trackingNumber });
  
  if (!result.success) {
    return { success: false, error: 'Invalid payload' };
  }

  try {
    await requireAdminAuth();
    
    await prisma.order.update({
      where: { id: result.data.id },
      data: { trackingNumber: result.data.trackingNumber },
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${result.data.id}`);
    
    return { success: true };
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
       return { success: false, error: 'Unauthorized' };
    }
    return { success: false, error: 'Database update failed' };
  }
}
