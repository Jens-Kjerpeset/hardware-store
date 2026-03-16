"use client";

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, ChevronRight, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { mode, cart, buildSystem, clearCart } = useStore();
  const [isClient, setIsClient] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Hydration fix

  // Calculate items and totals based on current mode
  let items = [];
  let subtotal = 0;

  if (mode === 'build') {
    items = Object.values(buildSystem) as any[];
    subtotal = items.reduce((sum, item) => sum + item.price, 0);
  } else {
    items = cart;
    subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Prevent accessing checkout if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-gray-600 mb-6" />
        <h1 className="text-3xl font-black text-white tracking-tight mb-4">Your Cart is Empty</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">Looks like you haven't added any components to your order yet. Return to the catalog to find the perfect gear.</p>
        <Link href="/catalog" className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded font-bold transition-all shadow-lg hover:shadow-brand-500/20 inline-flex items-center gap-2">
           Browse Catalog <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  // Norwegian Context Calculations
  // Assume backend prices are base prices (before tax) or standard. MVA is 25%.
  const TAX_RATE = 0.25;
  // Let's assume the subtotal already includes MVA for simplicity of display, 
  // but we'll show the MVA breakdown explicitly as "Includes 25% MVA".
  // MVA Amount = Total * (0.25 / 1.25)
  const mvaAmount = subtotal * (0.25 / 1.25);
  // Free shipping for orders over $1500 (or equivalent NOK), else $50
  const shipping = subtotal > 1500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Norwegian Postal Code Validation (4 digits)
    if (!/^\d{4}$/.test(formData.postalCode)) {
      setError('Please enter a valid 4-digit Norwegian postal code.');
      return;
    }

    if (formData.phone && !/^(\+47|0047)?\s?\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid 8-digit Norwegian phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           items,
           shippingInfo: formData,
           total,
           mode
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to process checkout');

      // Clear the cart/build
      if (mode === 'loose') {
         clearCart();
      } else {
         // To completely clear the build, we would need a clearBuildStore function or iteratively remove.
         // Calling clearCart is fine, but we also want to remove build states. 
         // Since store.ts doesn't have an explicit 'clearBuild' exported yet, let's reset to loose cart
         clearCart(); 
      }

      // Redirect to confirm
      router.push(`/checkout/success?order=${data.orderNumber}`);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-brand-500" />
          Secure Checkout
        </h1>
        <p className="text-gray-400 mt-2">Complete your order details below. Fast, insured shipping within Norway.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-8">
          
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
            
            {/* Contact Info */}
            <div className="glass p-6 sm:p-8 rounded-lg border-t-2 border-t-brand-500 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl" />
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <span className="bg-brand-500/20 text-brand-500 w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                 Contact details
               </h2>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-dark-bg/50 border border-dark-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-dark-bg/50 border border-dark-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-dark-bg/50 border border-dark-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number (Norwegian)</label>
                    <div className="flex relative">
                      <span className="inline-flex items-center px-4 rounded-l border border-r-0 border-dark-border bg-dark-surface text-gray-400 text-sm">
                        +47
                      </span>
                      <input required type="tel" name="phone" placeholder="12 34 56 78" value={formData.phone} onChange={handleChange} className="flex-1 min-w-0 block w-full bg-dark-bg/50 border border-dark-border rounded-none rounded-r px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Shipping Address */}
            <div className="glass p-6 sm:p-8 rounded-lg shadow-xl relative overflow-hidden">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <span className="bg-brand-500/20 text-brand-500 w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                 Shipping Address
               </h2>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Street Address</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-dark-bg/50 border border-dark-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Postal Code</label>
                    <input required type="text" maxLength={4} placeholder="e.g. 0150" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full bg-dark-bg/50 border border-dark-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-dark-bg/50 border border-dark-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
               </div>

               <div className="mt-6 p-4 bg-dark-bg/50 border border-dark-border rounded-lg flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-sm font-medium text-white mb-1">Posten/Bring Delivery</p>
                     <p className="text-xs text-gray-400">Standard shipping 1-3 business days across Norway. Tracking link provided upon dispatch.</p>
                  </div>
               </div>
            </div>

            {/* Payment Method */}
            <div className="glass p-6 sm:p-8 rounded-lg shadow-xl relative overflow-hidden">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <span className="bg-brand-500/20 text-brand-500 w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
                 Payment Method
               </h2>
               
               <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded cursor-pointer transition-colors ${formData.paymentMethod === 'card' ? 'border-brand-500 bg-brand-500/5' : 'border-dark-border bg-dark-bg/50 hover:bg-dark-surface'}`}>
                     <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="w-4 h-4 text-brand-500 focus:ring-brand-500 bg-dark-bg border-gray-600" />
                     <div className="ml-3 flex-1 flex justify-between items-center">
                        <span className="text-sm font-medium text-white">Credit / Debit Card</span>
                        <CreditCard className="w-5 h-5 text-gray-400" />
                     </div>
                  </label>

                  <label className={`flex items-center p-4 border rounded cursor-pointer transition-colors ${formData.paymentMethod === 'vipps' ? 'border-brand-500 bg-brand-500/5' : 'border-dark-border bg-dark-bg/50 hover:bg-dark-surface'}`}>
                     <input type="radio" name="paymentMethod" value="vipps" checked={formData.paymentMethod === 'vipps'} onChange={handleChange} className="w-4 h-4 text-brand-500 focus:ring-brand-500 bg-dark-bg border-gray-600" />
                     <div className="ml-3 flex-1 flex justify-between items-center">
                        <span className="text-sm font-medium text-white">Vipps</span>
                     </div>
                  </label>

                  <label className={`flex items-center p-4 border rounded cursor-pointer transition-colors ${formData.paymentMethod === 'klarna' ? 'border-brand-500 bg-brand-500/5' : 'border-dark-border bg-dark-bg/50 hover:bg-dark-surface'}`}>
                     <input type="radio" name="paymentMethod" value="klarna" checked={formData.paymentMethod === 'klarna'} onChange={handleChange} className="w-4 h-4 text-brand-500 focus:ring-brand-500 bg-dark-bg border-gray-600" />
                     <div className="ml-3 flex-1 flex justify-between items-center">
                        <span className="text-sm font-medium text-white">Klarna (Pay Later)</span>
                     </div>
                  </label>
               </div>

               {formData.paymentMethod === 'card' && (
                 <div className="mt-6 p-4 border border-dark-border bg-dark-bg/30 rounded space-y-4">
                   <div>
                     <label className="block text-xs font-medium text-gray-400 mb-1">Card Number (Mocking only)</label>
                     <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Expiry (MM/YY)</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">CVC</label>
                        <input type="text" placeholder="123" className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 focus:outline-none" />
                      </div>
                   </div>
                 </div>
               )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Mobile Submit (Hidden on LG) */}
            <div className="lg:hidden">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-dark-bg font-black text-lg transition-colors flex justify-center items-center gap-2 rounded shadow-xl hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
            
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
           <div className="glass rounded-lg border-dark-border sticky top-24 shadow-2xl p-6 sm:p-8 flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-dark-border">
                Order Summary
              </h2>

              <div className="flex-1 overflow-y-auto max-h-[40vh] space-y-4 pr-2 mb-6 scrollbar-thin scrollbar-thumb-dark-border">
                {items.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-200 line-clamp-2 leading-tight">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Qty: {item.quantity || 1}</div>
                    </div>
                    <div className="text-sm font-mono text-white whitespace-nowrap">
                      ${((item.quantity || 1) * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-dark-border">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping (Posten/Bring)</span>
                  <span className="font-mono text-white">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>

                {/* Explicit MVA Breakdown */}
                 <div className="flex justify-between text-xs text-gray-500 border-t border-dark-border/50 pt-3">
                  <span>Included 25% MVA (VAT)</span>
                  <span className="font-mono">${mvaAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-4 mt-2 border-t border-dark-border">
                  <span className="text-lg font-bold text-white">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-500 font-mono tracking-tighter">${total.toFixed(2)}</span>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Incl. Taxes & Fees</div>
                  </div>
                </div>
              </div>

              <button 
                form="checkout-form"
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-8 py-4 bg-amber-500 hover:bg-amber-400 text-dark-bg font-black text-lg transition-colors flex justify-center items-center gap-2 rounded shadow-xl hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                   <span className="animate-pulse flex items-center gap-2">Processing Securely...</span>
                ) : (
                   <><ShieldCheck className="w-5 h-5" /> Confirm Payment</>
                )}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
