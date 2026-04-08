import { prisma } from '@/lib/prisma';
import { PromotionForm } from '@/components/admin/PromotionForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminNewPromotionPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex flex-col w-full py-8 text-zinc-100 max-w-4xl mx-auto space-y-8">
       <div className="flex items-center gap-4">
         <Link href="/admin/promotions" className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
         </Link>
         <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Create Promotion</h1>
           <p className="text-zinc-400 mt-1">Configure discount rules and limitations.</p>
         </div>
       </div>

       <PromotionForm target={null} categories={categories} />
    </div>
  );
}
