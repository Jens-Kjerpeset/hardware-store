import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminNewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex flex-col w-full py-8 text-zinc-100 max-w-4xl mx-auto space-y-8">
       <div className="flex items-center gap-4">
         <Link href="/admin/products" className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
         </Link>
         <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Add Product</h1>
           <p className="text-zinc-400 mt-1">Create a new product in the catalog.</p>
         </div>
       </div>

       <ProductForm target={null} categories={categories} />
    </div>
  );
}
