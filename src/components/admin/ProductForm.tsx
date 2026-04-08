'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useTransition, useEffect } from 'react';
import { upsertProduct } from '@/app/actions/admin/products';
import { useRouter } from 'next/navigation';
import { Loader2, ImageOff } from 'lucide-react';

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  imageUrl: z.string().min(1, 'Image URL corresponds to the image path'),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.string().uuid(),
  supplier: z.string().optional(),
  discountPercent: z.coerce.number().optional(),
  isActive: z.boolean(),
  specs: z.record(z.string(), z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductForm({ target, categories }: { target: any, categories: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');

  let formattedSpecs: Record<string, string> = {};
  try {
    if (target?.specsJson) {
      const parsed = JSON.parse(target.specsJson);
      // Simplify nested specs to string entries for the form engine if needed
      for (const key of Object.keys(parsed)) {
        formattedSpecs[key] = String(parsed[key]);
      }
    }
  } catch (e) {}

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      id: target?.id,
      name: target?.name || '',
      description: target?.description || '',
      price: target?.price || 0,
      cost: target?.cost || 0,
      stock: target?.stock !== undefined ? target.stock : 10,
      lowStockThreshold: target?.lowStockThreshold !== undefined ? target.lowStockThreshold : 5,
      sku: target?.sku || '',
      imageUrl: target?.imageUrl || '/assets/placeholder.jpg',
      brand: target?.brand || '',
      categoryId: target?.categoryId || categories[0]?.id || '',
      supplier: target?.supplier || '',
      discountPercent: target?.discountPercent || 0,
      isActive: target?.isActive !== undefined ? target.isActive : true,
      specs: formattedSpecs,
    }
  });

  const { watch, setValue, handleSubmit, register, formState: { errors } } = form;
  const currentCategoryId = watch('categoryId');
  const currentPrice = watch('price') || 0;
  const currentCost = watch('cost') || 0;
  const currentImgUrl = watch('imageUrl') || '';
  
  const absoluteProfit = currentPrice - currentCost;
  const marginPercentage = currentPrice > 0 ? ((absoluteProfit / currentPrice) * 100).toFixed(1) : '0.0';

  // Dynamic Specs Generator
  const activeCategoryConfig = categories.find(c => c.id === currentCategoryId);
  let parsedFieldsJson: { name: string, type: string }[] = [];
  try {
    if (activeCategoryConfig?.fieldsJson) {
      parsedFieldsJson = JSON.parse(activeCategoryConfig.fieldsJson);
    }
  } catch (e) {}

  // Flush specs if category changes visually
  useEffect(() => {
    if (target && target.categoryId === currentCategoryId) {
      // Retain original specs if we map to the original category
      setValue('specs', formattedSpecs);
    } else {
      // Clear out the specs tracking object for the new category format
      setValue('specs', {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategoryId]);

  const onSubmit = (data: FormValues) => {
    setErrorLine('');
    
    // Normalize empty strings safely
    const normalizedData = {
      ...data,
      sku: data.sku || null,
      supplier: data.supplier || null,
      discountPercent: data.discountPercent || null,
      specsJson: JSON.stringify(data.specs || {})
    };

    startTransition(async () => {
      const result = await upsertProduct(normalizedData);
      if (result.success) {
        router.push('/admin/products');
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

      {/* Primary Details */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
         <h2 className="text-xl font-bold tracking-tight text-white mb-2">General Information</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Product Name</label>
             <input disabled={isPending} {...register('name')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
             {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
           </div>
           
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Brand</label>
             <input disabled={isPending} {...register('brand')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>

           <div className="md:col-span-2">
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Description</label>
             <textarea disabled={isPending} {...register('description')} rows={4} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>

           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Image URL</label>
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 shrink-0 rounded bg-[#1f1614] border border-border flex items-center justify-center overflow-hidden relative">
                 {currentImgUrl ? (
                   <img 
                      src={currentImgUrl.replace('/products/', '/assets/').replace('_FINAL', '')} 
                      alt="Preview" 
                      className="w-full h-full object-contain absolute inset-0 z-10 bg-[#1f1614]"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                   />
                 ) : null}
                 <ImageOff className="w-4 h-4 text-zinc-600 absolute z-0" />
               </div>
               <input disabled={isPending} {...register('imageUrl')} placeholder="/assets/example.jpg" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
             </div>
           </div>

           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">SKU</label>
             <input disabled={isPending} {...register('sku')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>

            <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Hardware Category</label>
             <select disabled={isPending} {...register('categoryId')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand font-medium">
               {categories.map((c) => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
           </div>

            <div className="flex items-center gap-3 pt-6">
             <input type="checkbox" disabled={isPending} id="isActive" {...register('isActive')} className="w-4 h-4 rounded bg-background accent-brand" />
             <label htmlFor="isActive" className="text-sm font-semibold text-zinc-300">Active</label>
           </div>
         </div>
      </div>

      {/* Pricing & Margins */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
           <h2 className="text-xl font-bold tracking-tight text-white">Pricing & Inventory</h2>
           <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-full text-xs font-bold text-zinc-300">
              Profit: <span className={absoluteProfit >= 0 ? "text-green-400" : "text-red-400"}>{absoluteProfit >= 0 ? '+' : ''}{absoluteProfit.toFixed(2)} Kr</span>
              <span className="text-zinc-600">|</span>
              <span className={absoluteProfit >= 0 ? "text-green-400" : "text-red-400"}>{marginPercentage}% margin</span>
           </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Price</label>
             <input disabled={isPending} type="number" step="0.01" {...register('price')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Cost</label>
             <input disabled={isPending} type="number" step="0.01" {...register('cost')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Total Stock</label>
             <input disabled={isPending} type="number" {...register('stock')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-zinc-400 mb-1">Low Warning</label>
             <input disabled={isPending} type="number" {...register('lowStockThreshold')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" />
           </div>
         </div>
      </div>

      {/* Dynamic Specification Engine */}
      <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
         <h2 className="text-xl font-bold tracking-tight text-white">Dynamic Specifications</h2>
         <p className="text-xs text-zinc-500 mb-4">Specifications vary depending on the hardware category.</p>
         
         <div className="bg-background border border-border p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedFieldsJson.length === 0 ? (
               <p className="text-zinc-500 text-sm md:col-span-2">No custom specifications mapped for this category.</p>
            ) : (
               parsedFieldsJson.map((field) => (
                  <div key={field.name}>
                     <label className="block text-sm font-semibold text-zinc-400 mb-1">{field.name}</label>
                     <input 
                        disabled={isPending} 
                        type={field.type === 'number' ? 'number' : 'text'} 
                        {...register(`specs.${field.name}`)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand" 
                     />
                  </div>
               ))
            )}
         </div>
      </div>
      
      <div className="flex justify-end pt-4 pb-24">
         <button 
           type="submit" 
           disabled={isPending} 
           className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
         >
           {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
           {target ? 'Update Product' : 'Create Product'}
         </button>
      </div>

    </form>
  );
}
