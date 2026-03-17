"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProduct(id: string, data: Partial<{
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  brand: string;
  categoryId: string;
  specsJson: string;
  imageUrl: string;
}>) {
  try {
    await prisma.product.update({
      where: { id },
      data
    });
    
    revalidatePath('/admin/inventory');
    revalidatePath('/catalog');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  brand: string;
  categoryId: string;
  specsJson: string;
  imageUrl: string;
}) {
  try {
    const newProduct = await prisma.product.create({
      data
    });
    
    revalidatePath('/admin/inventory');
    revalidatePath('/catalog');
    
    return { success: true, product: newProduct };
  } catch (error) {
    console.error('Failed to create product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    
    revalidatePath('/admin/inventory');
    revalidatePath('/catalog');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}
