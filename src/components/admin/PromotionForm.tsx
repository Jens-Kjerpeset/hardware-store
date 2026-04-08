'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { upsertPromotion } from '@/app/actions/admin/promotions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const formatDateForInput = (dateObject: Date | null | undefined | string) => {
  if (!dateObject) return '';
  const d = new Date(dateObject);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, 'Code must be at least 3 characters').transform(v => v.toUpperCase()),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountPercent: z.unknown().transform(v => (v === '' ? undefined : Number(v))),
  discountAmount: z.unknown().transform(v => (v === '' ? undefined : Number(v))),
  isActive: z.boolean(),
  maxUses: z.unknown().transform(v => (v === '' ? undefined : Number(v))),
  minOrderValue: z.unknown().transform(v => (v === '' ? undefined : Number(v))),
  expiresAt: z.string().optional(),
  applicableCategoryIds: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.discountType === 'PERCENTAGE') {
    if (!data.discountPercent || Number(data.discountPercent) <= 0 || Number(data.discountPercent) > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid percentage (1-100) required.',
        path: ['discountPercent']
      });
    }
  } else if (data.discountType === 'FIXED') {
    if (!data.discountAmount || Number(data.discountAmount) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid fixed amount required.',
        path: ['discountAmount']
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

export function PromotionForm({ target, categories }: { target: any, categories: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');

  let defaultCategories: string[] = [];
  if (target?.applicableCategoryIds) {
    defaultCategories = target.applicableCategoryIds.split(',').map((s: string) => s.trim());
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      id: target?.id,
      code: target?.code || '',
      discountType: target?.discountType || 'PERCENTAGE',
      discountPercent: target?.discountPercent || '',
      discountAmount: target?.discountAmount || '',
      isActive: target?.isActive !== undefined ? target.isActive : true,
      maxUses: target?.maxUses || '',
      minOrderValue: target?.minOrderValue || '',
      expiresAt: formatDateForInput(target?.expiresAt),
      applicableCategoryIds: defaultCategories,
    }
  });

  const { watch, register, handleSubmit, formState: { errors } } = form;
  const currentType = watch('discountType');

  const onSubmit = (data: FormValues) => {
    setErrorLine('');
    
    startTransition(async () => {
      const normalizedData = {
        ...data,
        applicableCategoryIds: data.applicableCategoryIds?.length ? data.applicableCategoryIds.join(',') : null,
      };

      const result = await upsertPromotion(normalizedData);
      if (result.success) {
        router.push('/admin/promotions');
      } else {
        setErrorLine(result.error || 'Failed to submit form');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 w-full max-w-4xl opacity-100 transition-opacity" style={{ opacity: isPending ? 0.5 : 1 }}>
      {errorLine && (
         <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
           {errorLine}
         </div>
      )}

      {/* Primary Generation block */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
         <h2 className="text-xl font-bold tracking-tight text-white mb-2">General Information</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Discount Code</label>
             <input disabled={isPending} {...register('code')} placeholder="SUMMER50" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-brand" />
             {errors.code && <p className="text-red-400 text-xs mt-1">{String(errors.code.message)}</p>}
           </div>

           <div className="flex items-center gap-3 pt-6 md:pl-4">
             <input type="checkbox" disabled={isPending} id="isActive" {...register('isActive')} className="w-4 h-4 rounded bg-background accent-brand" />
             <label htmlFor="isActive" className="text-sm font-semibold text-zinc-300">Active</label>
           </div>
         </div>
      </div>

      {/* Value & Constraints */}
      <div className="bg-background border border-border p-6 rounded-xl space-y-6">
         <h2 className="text-xl font-bold tracking-tight text-white mb-2">Value & Constraints</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Discount Type</label>
             <select disabled={isPending} {...register('discountType')} className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand font-medium">
               <option value="PERCENTAGE">Percentage (%)</option>
               <option value="FIXED">Fixed Amount</option>
             </select>
           </div>

           {currentType === 'PERCENTAGE' ? (
             <div>
               <label className="block text-sm font-semibold text-brand mb-1">Percentage (%)</label>
               <input disabled={isPending} type="number" step="1" {...register('discountPercent')} className="w-full bg-surface border border-brand rounded-md px-3 py-2 text-white focus:outline-none" />
               {errors.discountPercent && <p className="text-red-400 text-xs mt-1">{String(errors.discountPercent.message)}</p>}
             </div>
           ) : (
             <div>
               <label className="block text-sm font-semibold text-brand mb-1">Amount (Kr)</label>
               <input disabled={isPending} type="number" step="0.01" {...register('discountAmount')} className="w-full bg-surface border border-brand rounded-md px-3 py-2 text-white focus:outline-none" />
               {errors.discountAmount && <p className="text-red-400 text-xs mt-1">{String(errors.discountAmount.message)}</p>}
             </div>
           )}

           <div className="md:col-span-2">
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Minimum Order Requirement (Kr - Optional)</label>
             <input disabled={isPending} type="number" step="0.01" {...register('minOrderValue')} className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>

           <div className="md:col-span-2 space-y-2 pt-2 border-t border-border">
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Restrict to Categories (Optional)</label>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-surface p-4 rounded-md border border-border overflow-y-auto max-h-40">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <input type="checkbox" value={c.id} id={`cat-${c.id}`} {...register('applicableCategoryIds')} className="w-4 h-4 bg-background accent-brand" />
                    <label htmlFor={`cat-${c.id}`} className="text-sm text-zinc-300 select-none cursor-pointer">{c.name}</label>
                  </div>
                ))}
             </div>
           </div>

         </div>
      </div>

      {/* Limits & Scheduling */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
         <h2 className="text-xl font-bold tracking-tight text-white mb-2">Limits & Scheduling</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Maximum Total Uses (Optional)</label>
             <input disabled={isPending} type="number" placeholder="Leave empty for unlimited" {...register('maxUses')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>
           
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Expiration Date</label>
             <input disabled={isPending} type="datetime-local" {...register('expiresAt')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand [&::-webkit-calendar-picker-indicator]:invert" />
           </div>
         </div>
      </div>
      
      <div className="flex justify-end pt-4 pb-24">
         <button 
           type="submit" 
           disabled={isPending} 
           className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
         >
           {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
           {target ? 'Update Promotion' : 'Create Promotion'}
         </button>
      </div>

    </form>
  );
}
