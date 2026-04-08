import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import { OrderTrackingInput } from '@/components/admin/OrderTrackingInput';

const ORDER_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
];

const SHIPPING_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) return notFound();

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto py-8 text-zinc-100 space-y-8">
      
      {/* Header controls */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
        <Link href="/admin/orders" className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <Link 
          href={`/api/orders/${order.id}/invoice`}
          target="_blank"
          className="flex items-center gap-2 bg-zinc-100 text-zinc-900 border border-transparent hover:bg-white px-4 py-2 rounded-md font-bold text-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Download PDF Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-surface border border-border p-8 rounded-xl space-y-6">
             <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-xl font-bold text-white tracking-tight">Order #{order.id.split('-')[0].toUpperCase()}</h2>
                 <p className="text-zinc-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
               </div>
               <div className="text-right">
                 <div className="text-2xl font-black text-white">{formatCurrency(order.totalAmount)}</div>
                 <p className="text-zinc-500 text-sm mt-1">{order.items.length} total items</p>
               </div>
             </div>
          </div>

          <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
             <h3 className="font-bold text-white text-lg border-b border-border pb-4">Line Items</h3>
             <div className="space-y-4">
               {order.items.map((item) => (
                 <div key={item.id} className="flex justify-between items-center gap-4 py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                       <div className="w-12 h-12 bg-background border border-border rounded shrink-0 overflow-hidden relative">
                         {item.product.imageUrl && <img src={item.product.imageUrl.replace('/products/', '/assets/').replace('_FINAL', '')} alt={item.product.name} className="w-full h-full object-contain p-1" />}
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="font-bold text-white truncate text-sm">{item.product.name}</p>
                         <p className="text-xs text-zinc-500 truncate">{item.product.brand}</p>
                       </div>
                    </div>
                    <div className="text-right text-sm">
                       <p className="text-zinc-400">Qty: {item.quantity}</p>
                       <p className="font-bold text-white">{formatCurrency(item.priceAtTime * item.quantity)}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

        {/* Right Column: Customer & Status Map */}
        <div className="space-y-8">
           
           <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
              <h3 className="font-bold text-white text-lg border-b border-border pb-4">Order Fulfillment</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-semibold text-zinc-500 tracking-widest mb-2">Payment Status</label>
                    <OrderStatusSelect 
                      orderId={order.id} 
                      type="status" 
                      currentValue={order.status} 
                      options={ORDER_STATUS_OPTIONS} 
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-semibold text-zinc-500 tracking-widest mb-2">Shipping Status</label>
                    <OrderStatusSelect 
                      orderId={order.id} 
                      type="shippingStatus" 
                      currentValue={order.shippingStatus} 
                      options={SHIPPING_STATUS_OPTIONS} 
                    />
                 </div>

                 <OrderTrackingInput 
                   orderId={order.id} 
                   initialTrackingNumber={order.trackingNumber} 
                 />
              </div>
           </div>

           <div className="bg-surface border border-border p-6 rounded-xl space-y-4 text-sm">
              <h3 className="font-bold text-white text-lg border-b border-border pb-4">Customer Details</h3>
              
              <div>
                <p className="text-zinc-500 font-medium text-xs mb-1 tracking-wide">Account</p>
                <p className="font-bold text-white">{order.customer?.name || 'Guest'}</p>
                <p className="text-zinc-400">{order.customer?.email || 'N/A'}</p>
              </div>

              <div className="pt-2">
                <p className="text-zinc-500 font-medium text-xs mb-1 tracking-wide">Shipping Address</p>
                <p className="text-zinc-300 bg-background border border-border rounded p-3 whitespace-pre-line mt-2 break-words">
                  {order.shippingAddress || 'No shipment required (Digital/Pickup)'}
                </p>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
