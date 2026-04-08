import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { CheckCircle2, Package, MapPin, Truck, Mail } from 'lucide-react';

interface SuccessPageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { orderId } = await params;
  
  const cookieStore = await cookies();
  const customerSession = cookieStore.get('customer-session');
  
  if (!customerSession || !customerSession.value) {
    // IDOR boundary limit for unauthenticated
    notFound();
  }

  
  const order = await prisma.order.findUnique({
    where: { 
      id: orderId,
      customerId: customerSession.value
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Derived math for metrics
  let calculatedSubtotal = 0;
  order.items.forEach(item => {
    calculatedSubtotal += item.priceAtTime * item.quantity;
  });

  const calculatedShippingCost = order.totalAmount - calculatedSubtotal;
  const calculatedVAT = order.totalAmount * 0.2; // 25% inclusive MVA calculation
  
  // Format Logistics Gateway String
  const shippingMethodLabel = order.shippingGateway === 'standard' 
    ? 'Standard Delivery' 
    : order.shippingGateway === 'express' 
      ? 'Express Delivery' 
      : 'Pickup Point';

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      
      {/* Navigation Top Action */}
      <div className="mb-8 flex items-center">
        <Link href="/catalog" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          <span className="mr-2">&larr;</span> Continue Shopping
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-emerald-950/20 border border-emerald-900 rounded-lg p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex flex-col items-center text-center relative z-10 space-y-4">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(5,150,105,0.2)]">
             <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl pr-8 md:pr-0 md:text-5xl font-extrabold text-white tracking-tight">Order Confirmed</h1>
          <p className="text-zinc-400 text-lg max-w-lg">
            Your transaction was securely processed. We're getting your components ready for dispatch.
          </p>
          <div className="mt-4 inline-flex items-center justify-center py-2 px-6 rounded-full bg-black/40 border border-emerald-900/50 backdrop-blur-sm">
             <span className="text-sm text-zinc-400 mr-2">Reference ID:</span>
             <span className="font-mono text-emerald-400 font-bold">{order.id}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Block 1: Itemized Receipt */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col shadow-xl">
           <div className="p-6 border-b border-border bg-white/5 flex items-center gap-3">
             <Package className="h-5 w-5 text-brand" />
             <h2 className="text-lg font-bold text-white tracking-tight">Itemized Receipt</h2>
           </div>
           
           <div className="p-6 flex-1 flex flex-col">
             <div className="space-y-4 mb-6 pr-2 max-h-[300px] overflow-y-auto">
               {order.items.map((item) => (
                 <div key={item.id} className="flex justify-between items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="mt-0.5 text-xs font-mono font-bold bg-zinc-800 text-brand px-2 py-1 rounded">
                        x{item.quantity}
                      </div>
                      <div className="text-sm font-medium text-zinc-200 leading-tight">
                        {item.product.name}
                      </div>
                    </div>
                    <div className="text-sm font-mono font-semibold text-white whitespace-nowrap">
                      {(item.priceAtTime * item.quantity).toLocaleString('no-NO')} Kr
                    </div>
                 </div>
               ))}
             </div>

             <div className="mt-auto pt-6 border-t border-border space-y-3 relative">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-zinc-200 font-mono">{calculatedSubtotal.toLocaleString('no-NO')} Kr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 max-w-[200px] truncate">Shipping ({shippingMethodLabel})</span>
                  <span className="text-zinc-200 font-mono">{calculatedShippingCost.toLocaleString('no-NO')} Kr</span>
                </div>
                <div className="flex justify-between text-xs pt-2 pb-1 border-t border-dashed border-zinc-800">
                  <span className="text-zinc-400">Included VAT (25% MVA)</span>
                  <span className="text-zinc-400 font-mono">{Math.round(calculatedVAT).toLocaleString('no-NO')} Kr</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-border">
                  <span className="text-white tracking-tight">Total Paid</span>
                  <span className="text-emerald-400 font-mono">{order.totalAmount.toLocaleString('no-NO')} Kr</span>
                </div>
             </div>
           </div>
        </div>

        {/* Column Right */}
        <div className="space-y-8 flex flex-col">
          
          {/* Block 2: Logistics Confirmation */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-xl">
             <div className="p-6 border-b border-border bg-white/5 flex items-center gap-3">
               <Truck className="h-5 w-5 text-brand" />
               <h2 className="text-lg font-bold text-white tracking-tight">Logistics Details</h2>
             </div>
             
             {order.customer && (
               <div className="p-6 space-y-6">
                 <div>
                   <h3 className="text-xs font-bold tracking-wider text-zinc-400 mb-3">Shipping Address</h3>
                   <div className="flex items-start gap-3">
                     <MapPin className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                     <div className="text-sm text-zinc-300">
                       <p className="font-semibold text-white mb-1">{order.customer.name}</p>
                       <p>{order.shippingAddress}</p>
                     </div>
                   </div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                   <h3 className="text-xs font-bold tracking-wider text-zinc-400 mb-3">Contact Details</h3>
                   <div className="flex items-start gap-3">
                     <Mail className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                     <div className="text-sm text-zinc-300">
                       <p>{order.customer.email}</p>
                       <p>{order.customer.phone}</p>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>

          {/* Block 3: Next Steps & Support */}
          <div className="bg-background border border-border rounded-lg p-6 lg:p-8 relative overflow-hidden flex-1 flex flex-col justify-center">
             <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold text-white">What's Next?</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  A comprehensive digital receipt has been transmitted to your email. You will receive an SMS at (<span className="text-zinc-300 font-mono">{order.customer?.phone}</span>) once the logistic carrier has scanned the package.
                </p>
                <div className="pt-4">
                  <Link href="#" className="inline-flex text-sm font-bold text-brand hover:text-brand-hover underline decoration-brand/30 underline-offset-4 transition-colors">
                    Contact Support
                  </Link>
                </div>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
}
