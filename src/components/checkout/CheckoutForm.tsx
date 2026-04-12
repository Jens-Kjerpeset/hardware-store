'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBuilderStore, getActivePrice } from '@/store/useBuilderStore';
import { processCheckout } from '@/app/actions/checkout';
import { checkoutSchema } from '@/lib/schemas';
import type { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OrderSummary } from './OrderSummary';

type CheckoutSchemaFull = z.infer<typeof checkoutSchema>;
type CheckoutClientSchema = Omit<CheckoutSchemaFull, 'productIds'>;

const InputField = ({ label, name, type = "text", register, errors }: { label: string, name: any, type?: string, register: any, errors: any }) => {
  const errorMsg = name.includes('.') ? (errors.customer as any)?.[name.split('.')[1]]?.message : (errors as any)[name]?.message;
  return (
    <div className="flex flex-col gap-1.5 relative pb-6">
      <label htmlFor={name} className="text-sm font-medium text-zinc-300 ml-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        className={`w-full bg-background border px-4 py-2.5  text-white transition-colors focus:outline-none ${
          errorMsg 
            ? 'border-red-500 focus:border-red-400' 
            : 'border-border focus:border-brand hover:border-zinc-500'
        }`}
        aria-invalid={errorMsg ? "true" : "false"}
        {...register(name)}
      />
      {errorMsg && (
        <span className="text-[11px] tracking-wide font-semibold text-red-400 bg-red-950/20 border border-red-900/50  px-2 py-0.5 absolute bottom-0 left-0">
          {errorMsg as string}
        </span>
      )}
    </div>
  );
};

export function CheckoutForm() {
  const [mounted, setMounted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const { mode, components, buildStorage, looseCart, getTotalPrice, clearBuilder, clearLooseCart } = useBuilderStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutClientSchema>({
    resolver: zodResolver(checkoutSchema.omit({ productIds: true })),
    defaultValues: {
       shippingMethod: 'standard',
       paymentMethod: 'creditcard'
    }
  });

  const activeShippingMethod = watch('shippingMethod');
  const activePaymentMethod = watch('paymentMethod');
  const acceptedTerms = watch('acceptTerms');

  const onSubmit = async (data: CheckoutClientSchema) => {
    if (isPending) return;
    setIsPending(true);
    setErrorMessage('');

    let productIds: string[] = [];
    if (mode === 'build') {
      productIds = [
        ...Object.values(components).map(c => c.id),
        ...buildStorage.flatMap(s => Array(s.quantity).fill(s.id))
      ];
    } else {
      productIds = looseCart.flatMap(item => Array(item.quantity).fill(item.id));
    }

    try {
      const result = await processCheckout({ 
        productIds, 
        customer: data.customer, 
        shippingMethod: data.shippingMethod, 
        paymentMethod: data.paymentMethod, 
        cardNumber: data.cardNumber,
        acceptTerms: data.acceptTerms
      });
      if (result.success && result.orderId) {
        if (mode === 'build') clearBuilder(); else clearLooseCart();
        router.push(`/checkout/success/${result.orderId}`);
      } else {
        setErrorMessage(result.message);
        setIsPending(false);
      }
    } catch (e) {
      setErrorMessage("An unexpected error occurred while processing checkout.");
      setIsPending(false);
    }
  };

  // 1. Force strict hydration check
  if (!mounted) {
    return <div className="p-12 text-center text-zinc-400 font-medium">Securing Checkout Container...</div>;
  }

  // Generate current cart summary depending on global Zustand mode
  const cartItems = mode === 'build' 
    ? [...Object.values(components).map(c => ({...c, quantity: 1})), ...buildStorage] 
    : looseCart;

  // 3. Complete Empty State Early Return
  if (cartItems.length === 0) {
    return (
      <div className="p-16 text-center space-y-6 border border-border bg-surface   max-w-2xl mx-auto mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Cart Empty</h2>
        <p className="text-zinc-400">There are no hardware components pre-assigned to your cart.</p>
        <Link href="/catalog" className="inline-flex mt-4 px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold  border border-border transition-colors">
          Browse Components
        </Link>
      </div>
    );
  }



  return (
    <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_400px] gap-8 items-start">
      
      {/* 4. Left Data Column */}
      <div className="space-y-6 w-full">
        {errorMessage && (
          <div className="p-4 bg-red-950/20 border border-red-900/50  text-red-500 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="bg-surface border border-border  p-6 lg:p-8 space-y-8">
             <div className="space-y-1">
               <h2 className="text-xl font-bold text-white tracking-tight">Contact Information</h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InputField label="First Name" name="customer.firstName" register={register} errors={errors} />
               <InputField label="Last Name" name="customer.lastName" register={register} errors={errors} />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Email Address" name="customer.email" type="email" register={register} errors={errors} />
                <InputField label="Phone Number" name="customer.phone" type="tel" register={register} errors={errors} />
             </div>
          </div>

          <div className="bg-surface border border-border  p-6 lg:p-8 space-y-8">
             <div className="space-y-1">
               <h2 className="text-xl font-bold text-white tracking-tight">Shipping Details</h2>
             </div>
             <InputField label="Address" name="customer.address" register={register} errors={errors} />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InputField label="Postal Code" name="customer.postalCode" register={register} errors={errors} />
               <InputField label="City" name="customer.city" register={register} errors={errors} />
             </div>

             <div className="pt-6 border-t border-border space-y-4">
               <h3 className="text-sm font-semibold text-zinc-300">Shipping Method</h3>
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { id: 'standard', label: 'Standard Delivery', sub: '3-5 Business Days', price: '99 Kr' },
                   { id: 'express', label: 'Express Delivery', sub: '1-2 Business Days', price: '199 Kr' },
                   { id: 'pickup', label: 'Pickup Point', sub: 'Local Post Office', price: '49 Kr' },
                 ].map(method => (
                   <label key={method.id} className={`flex items-center justify-between p-4 border  cursor-pointer transition-colors ${activeShippingMethod === method.id ? 'border-brand bg-brand/5' : 'border-border bg-background hover:border-zinc-500'}`}>
                     <div className="flex items-center gap-3">
                        <input type="radio" value={method.id} {...register('shippingMethod')} className="w-4 h-4 accent-brand" />
                        <div>
                          <p className="text-sm font-medium text-white">{method.label}</p>
                          <p className="text-xs text-zinc-400">{method.sub}</p>
                        </div>
                     </div>
                     <span className="text-sm font-mono font-medium text-zinc-300">{method.price}</span>
                   </label>
                 ))}
               </div>
             </div>
          </div>
          
          <div className="bg-surface border border-border  p-6 lg:p-8 space-y-8">
             <div className="space-y-1">
               <h2 className="text-xl font-bold text-white tracking-tight">Payment Method</h2>
             </div>
             
             <div className="space-y-4">
               <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'creditcard', label: 'Credit Card' },
                   { id: 'vipps', label: 'Vipps' },
                   { id: 'klarna', label: 'Klarna' },
                 ].map(method => (
                   <label key={method.id} className={`flex flex-col items-center justify-center p-3 border  cursor-pointer transition-colors text-sm font-medium ${activePaymentMethod === method.id ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-background text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'}`}>
                      <input type="radio" value={method.id} {...register('paymentMethod')} className="sr-only" />
                      {method.label}
                   </label>
                 ))}
               </div>
             </div>

             {activePaymentMethod === 'creditcard' && (
               <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                   <div className="flex flex-col gap-1.5">
                     <label htmlFor="cardNumber" className="text-sm font-medium text-zinc-300 ml-1">Card Number</label>
                     <input id="cardNumber" type="text" {...register('cardNumber')} placeholder="0000 0000 0000 0000" className="w-full bg-background border border-border px-4 py-2.5  text-white focus:outline-none focus:border-brand" />
                   </div>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-zinc-300 ml-1">Expiry Date</label>
                   <input type="text" placeholder="MM/YY" className="w-full bg-background border border-border px-4 py-2.5  text-white focus:outline-none focus:border-brand" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-zinc-300 ml-1">CVC</label>
                   <input type="text" placeholder="123" className="w-full bg-background border border-border px-4 py-2.5  text-white focus:outline-none focus:border-brand" />
                 </div>
               </div>
             )}
          </div>

          <div className="bg-surface border border-border  p-6 flex flex-col gap-2 relative pb-8 relative">
             <label className="flex items-start gap-3 cursor-pointer group">
               <input type="checkbox" {...register('acceptTerms')} className="mt-1 w-4 h-4 accent-brand shrink-0" />
               <span className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  I accept the Hardware Store <Link href="#" className="underline decoration-zinc-700 hover:text-brand">Terms of Service</Link> and <Link href="#" className="underline decoration-zinc-700 hover:text-brand">Privacy Policy</Link>, and consent to processing my personal data for order fulfillment.
               </span>
             </label>
             {errors.acceptTerms && (
               <span className="text-[11px] tracking-wide font-semibold text-red-400 bg-red-950/20 border border-red-900/50  px-2 py-0.5 absolute bottom-3 left-6">
                 {errors.acceptTerms.message as string}
               </span>
             )}
          </div>
          
          <div className="lg:hidden pb-4">
             <button
               type="submit"
               disabled={isPending || !acceptedTerms}
               className={`w-full py-4  font-bold tracking-widest flex items-center justify-center transition-all ${
                 isPending
                   ? 'bg-emerald-600/50 border-emerald-500/50 text-white cursor-wait'
                   : !acceptedTerms
                     ? 'bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed'
                     : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white )] )]'
               }`}
             >
               {isPending ? 'Processing...' : 'Place Order'}
             </button>
          </div>

        </form>
      </div>

      <OrderSummary 
         cartItems={cartItems} 
         shippingMethod={activeShippingMethod} 
         isPending={isPending} 
         isLocked={!acceptedTerms}
      />
    </div>
  );
}
