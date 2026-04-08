import { getActivePrice } from '@/store/useBuilderStore';

interface OrderSummaryProps {
  cartItems: any[];
  shippingMethod: 'standard' | 'express' | 'pickup' | undefined;
  isPending: boolean;
  isLocked: boolean;
}

export function OrderSummary({ cartItems, shippingMethod, isPending, isLocked }: OrderSummaryProps) {
  let subtotal = 0;
  cartItems.forEach(item => {
     subtotal += getActivePrice(item) * item.quantity;
  });

  let shippingCost = 0;
  if (shippingMethod === "standard") shippingCost = 99;
  else if (shippingMethod === "express") shippingCost = 199;
  else if (shippingMethod === "pickup") shippingCost = 49;

  const finalTotal = subtotal + shippingCost;
  const vat = finalTotal * 0.2; // 25% inclusive VAT extraction

  return (
      <div className="bg-surface border border-border p-6 rounded-lg sticky top-6 shadow-2xl space-y-6 w-full">
        <h3 className="text-lg font-bold text-white border-b border-border pb-4">Order Summary</h3>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {cartItems.map((item, idx) => {
             const derivedPrice = getActivePrice(item);
             return (
               <div key={`${item.id}-${idx}`} className="flex justify-between items-start gap-3 text-sm border border-transparent hover:bg-white/5 p-1 -mx-1 rounded transition-colors">
                  <div className="text-zinc-300 leading-snug">
                    <span className="text-brand mr-2 font-mono font-bold">x{item.quantity}</span>
                    {item.name}
                  </div>
                  <div className="text-white font-mono font-semibold shrink-0 mt-0.5">
                    {(derivedPrice * item.quantity).toLocaleString('no-NO')} Kr
                  </div>
               </div>
             );
          })}
        </div>

        <div className="pt-4 border-t border-border space-y-3 text-sm font-medium">
           <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="text-white">{subtotal.toLocaleString('no-NO')} Kr</span>
           </div>
           {shippingMethod && (
             <div className="flex justify-between text-zinc-400">
                <span>Shipping Cost</span>
                <span className="text-white">{shippingCost > 0 ? `${shippingCost.toLocaleString('no-NO')} Kr` : 'Free'}</span>
             </div>
           )}
           <div className="flex justify-between text-zinc-400 text-xs">
              <span>Included VAT (25%)</span>
              <span>{Math.round(vat).toLocaleString('no-NO')} Kr</span>
           </div>
        </div>

        <div className="pt-4 border-t border-border space-y-6">
           <div className="flex justify-between items-center text-2xl font-bold font-mono">
              <span className="text-zinc-400 tracking-tight">Total</span>
              <span className="text-white">{finalTotal.toLocaleString('no-NO')} Kr</span>
           </div>

           <button
             form="checkout-form"
             type="submit"
             data-testid="checkout-submit-btn"
             disabled={isPending || isLocked}
             className={`w-full py-4 rounded font-bold tracking-widest flex items-center justify-center transition-all ${
               isPending
                 ? 'bg-emerald-600/50 border-emerald-500/50 text-white cursor-wait'
                 : isLocked
                   ? 'bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed'
                   : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:shadow-[0_0_30px_rgba(5,150,105,0.6)]'
             }`}
           >
             {isPending ? 'Processing...' : 'Place Order'}
           </button>
        </div>
      </div>
  );
}
