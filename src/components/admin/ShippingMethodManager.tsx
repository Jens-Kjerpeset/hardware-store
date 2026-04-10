'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { upsertShippingMethod, deleteShippingMethod } from '@/app/actions/admin/settings';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';

const shippingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Shipping method name is required'),
  price: z.coerce.number().min(0, 'Shipping price cannot be negative'),
  estimatedDays: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  storeSettingsId: z.string().uuid()
});

type FormValues = z.infer<typeof shippingSchema>;

export function ShippingMethodManager({ storeSettingsId, methods }: { storeSettingsId: string, methods: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorLine, setErrorLine] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(shippingSchema) as any,
    defaultValues: { storeSettingsId, isActive: true, price: 0 }
  });

  const startEdit = (m: any) => {
    setIsEditingId(m.id);
    setIsCreating(false);
    form.reset({
      id: m.id,
      name: m.name,
      price: m.price,
      estimatedDays: m.estimatedDays || '',
      description: m.description || '',
      isActive: m.isActive,
      storeSettingsId
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditingId(null);
    form.reset({
      storeSettingsId,
      isActive: true,
      price: 0,
      name: '',
      estimatedDays: '',
      description: ''
    });
  };

  const cancelForm = () => {
    setIsCreating(false);
    setIsEditingId(null);
    form.reset();
    setErrorLine('');
  };

  const onSubmit = (data: FormValues) => {
    setErrorLine('');
    startTransition(async () => {
      const normalizedData = {
        ...data,
        estimatedDays: data.estimatedDays || null,
        description: data.description || null
      };

      const result = await upsertShippingMethod(normalizedData);
      if (result.success) {
        cancelForm();
      } else {
        setErrorLine(result.error || 'Failed to save shipping method.');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this shipping method?")) return;
    startTransition(async () => {
      await deleteShippingMethod(id);
    });
  };

  const isFormActive = isCreating || isEditingId !== null;

  return (
    <div className={`w-full space-y-6 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
       <div className="flex items-center justify-between gap-4">
         <h2 className="text-lg font-bold tracking-tight text-white">Shipping Methods</h2>
         <button onClick={startCreate} disabled={isFormActive || isPending} className="mt-1 bg-surface border border-border hover:bg-zinc-800 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center justify-center gap-1 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Method
         </button>
       </div>

       {/* Form Overlay Area vertically nested inside the bounds */}
       {isFormActive && (
          <div className="bg-[#141414] border border-brand/50 rounded-xl p-6 relative">
            <button onClick={cancelForm} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
               <X className="w-5 h-5" />
            </button>
            <h3 className="text-white font-bold mb-4">{isCreating ? 'Add New Shipping Method' : 'Edit Shipping Method'}</h3>
            {errorLine && <p className="text-red-400 text-xs mb-4">{errorLine}</p>}
            
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-zinc-400 mb-1">Method Name</label>
                   <input disabled={isPending} {...form.register('name')} placeholder="Express Next-Day Tracking" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-semibold text-zinc-400 mb-1">Price (Kr)</label>
                   <input disabled={isPending} type="number" step="0.01" {...form.register('price')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
                 </div>

                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-zinc-400 mb-1">Estimated Delivery Time (Optional)</label>
                   <input disabled={isPending} {...form.register('estimatedDays')} placeholder="2-5 Business Days" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
                 </div>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
                 <input type="checkbox" disabled={isPending} id="isActiveShip" {...form.register('isActive')} className="w-4 h-4 rounded bg-background accent-brand" />
                 <label htmlFor="isActiveShip" className="text-sm font-semibold text-zinc-300">Active and available during checkout.</label>
               </div>

               <div className="flex justify-end pt-4">
                 <button type="submit" disabled={isPending} className="bg-brand hover:bg-brand-hover text-white px-6 py-2 rounded font-bold transition-colors flex items-center gap-2">
                   {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Method
                 </button>
               </div>
            </form>
          </div>
       )}

       <div className="grid grid-cols-1 gap-4">
          {methods.length === 0 && !isFormActive ? (
             <div className="text-zinc-500 text-sm text-center py-6 border border-border bg-surface rounded-xl">No shipping methods configured. Customers won't be able to checkout!</div>
          ) : (
             methods.map(m => (
                <div key={m.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface border border-border p-4 rounded-xl">
                   <div>
                      <h4 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                        {m.name} 
                        {!m.isActive && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded ">Suspended</span>}
                      </h4>
                      <div className="text-xs text-zinc-500 mt-1">
                        Price: Kr {m.price.toFixed(2)} {m.estimatedDays ? `— ${m.estimatedDays}` : ''}
                      </div>
                   </div>
                   <div className="flex items-center gap-2 w-full md:w-auto">
                      <button disabled={isPending} onClick={() => startEdit(m)} className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors px-2 py-1 bg-brand/10 rounded">Edit</button>
                      <button disabled={isPending} onClick={() => handleDelete(m.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors p-1.5"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
}
