import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ take: 1 });
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    const serializedError = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      clientVersion: error.clientVersion,
      code: error.code
    };
    return NextResponse.json({ success: false, error: serializedError }, { status: 500 });
  }
}
