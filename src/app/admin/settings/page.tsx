import { prisma } from '@/lib/prisma';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { ShippingMethodManager } from '@/components/admin/ShippingMethodManager';

export default async function AdminSettingsPage() {
  // Query the Singleton
  let target = await prisma.storeSettings.findFirst({
    include: { shippingMethods: { orderBy: { price: 'asc' } } }
  });

  // Defensive execution against wiped DB seeding constraints
  if (!target) {
    target = await prisma.storeSettings.create({
      data: { storeName: 'Hardware Store' },
      include: { shippingMethods: true }
    });
  }

  return (
    <div className="flex flex-col w-full py-8 text-zinc-100 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Store Configuration</h1>
        <p className="text-zinc-400 mt-1">Manage global store settings, taxes, and shipping rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-2 space-y-8">
           <StoreSettingsForm target={target} />
         </div>

         <div className="lg:col-span-1 space-y-8">
           <div className="bg-background border border-border p-6 ">
              <ShippingMethodManager storeSettingsId={target.id} methods={target.shippingMethods} />
           </div>
         </div>
      </div>
    </div>
  );
}
