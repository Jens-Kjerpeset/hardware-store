'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { updateStoreSettings } from '@/app/actions/admin/settings';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  id: z.string(),
  storeName: z.string().min(1, 'Store Name is required'),
  contactEmail: z.string().email('Invalid email').or(z.literal('')),
  taxRate: z.coerce.number().min(0).max(100),
  defaultCurrency: z.string().min(1),
  timezone: z.string().min(1),
  notifyNewOrder: z.boolean(),
  notifyLowStock: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

export function StoreSettingsForm({ target }: { target: any }) {
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Convert Prisma's float 0.25 mathematically to 25 for human UX
  const parsedTaxRate = target.taxRate ? Number((target.taxRate * 100).toFixed(2)) : 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: target.id,
      storeName: target.storeName || '',
      contactEmail: target.contactEmail || '',
      taxRate: parsedTaxRate,
      defaultCurrency: target.defaultCurrency || 'NOK',
      timezone: target.timezone || 'Europe/Oslo',
      notifyNewOrder: target.notifyNewOrder !== undefined ? target.notifyNewOrder : true,
      notifyLowStock: target.notifyLowStock !== undefined ? target.notifyLowStock : true,
    }
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    setErrorLine('');
    setSuccessMsg('');
    
    startTransition(async () => {
      const normalizedData = {
        ...data,
        contactEmail: data.contactEmail || null,
      };

      const result = await updateStoreSettings(normalizedData);
      if (result.success) {
        setSuccessMsg('Store settings updated successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorLine(result.error || 'Failed to update settings.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full opacity-100 transition-opacity" style={{ opacity: isPending ? 0.5 : 1 }}>
      {errorLine && (
         <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
           {errorLine}
         </div>
      )}
      {successMsg && (
         <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm font-medium">
           {successMsg}
         </div>
      )}

      {/* Global Brand Identity */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
         <h2 className="text-lg font-bold tracking-tight text-white mb-2">General Information</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Store Name</label>
             <input disabled={isPending} {...register('storeName')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
             {errors.storeName && <p className="text-red-400 text-xs mt-1">{String(errors.storeName.message)}</p>}
           </div>

           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Admin Contact Email</label>
             <input disabled={isPending} type="email" placeholder="root@system.local" {...register('contactEmail')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>
         </div>
      </div>

      {/* Math & Localization */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
         <h2 className="text-lg font-bold tracking-tight text-white mb-2">Localization & Taxes</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
             <label className="block text-sm font-semibold text-brand mb-1">Default Tax Rate (%)</label>
             <input disabled={isPending} type="number" step="0.01" {...register('taxRate')} className="w-full bg-background border border-brand rounded-md px-3 py-2 text-white font-mono focus:outline-none" />
             <p className="text-xs text-zinc-500 mt-2">Parsed internally as a decimal. Standard VAT is 25%.</p>
           </div>
           
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">ISO Currency Fallback</label>
             <input disabled={isPending} {...register('defaultCurrency')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-brand" />
           </div>

           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Store Timezone</label>
             <input disabled={isPending} {...register('timezone')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-brand" />
           </div>
         </div>
      </div>

      {/* Notification Flags */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
         <h2 className="text-lg font-bold tracking-tight text-white mb-2">Email Notifications</h2>
         
         <div className="flex items-center gap-3">
            <input type="checkbox" disabled={isPending} id="notifyNewOrder" {...register('notifyNewOrder')} className="w-4 h-4 rounded bg-background accent-brand" />
            <label htmlFor="notifyNewOrder" className="text-sm font-semibold text-zinc-300">Notify admin on new orders via email.</label>
         </div>

         <div className="flex items-center gap-3">
            <input type="checkbox" disabled={isPending} id="notifyLowStock" {...register('notifyLowStock')} className="w-4 h-4 rounded bg-background accent-brand" />
            <label htmlFor="notifyLowStock" className="text-sm font-semibold text-zinc-300">Notify admin when products drop below their low stock threshold.</label>
         </div>
      </div>
      
      <div className="flex justify-end pt-6">
         <button 
           type="submit" 
           disabled={isPending} 
           className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
         >
           {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
           Save Settings
         </button>
      </div>

    </form>
  );
}
