import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'products');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('_v2.png'));
  const products = await prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  return NextResponse.json({ images: files, products });
}

export async function POST(req: Request) {
  const mapping = await req.json();
  const dir = path.join(process.cwd(), 'public', 'products');
  
  for (const [img, prodId] of Object.entries(mapping)) {
     if (prodId) {
       const prod = await prisma.product.findUnique({ where: { id: (prodId as string) } });
       if (prod) {
           const newName = `${prod.name}_v4.png`;
           try {
             fs.renameSync(path.join(dir, img), path.join(dir, newName));
             await prisma.product.update({ where: { id: prod.id }, data: { imageUrl: `/products/${newName}` } });
           } catch(e) {
             console.error('Failed to map', img, e);
           }
       }
     }
  }
  return NextResponse.json({ success: true });
}
