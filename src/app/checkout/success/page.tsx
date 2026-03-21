"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "NOK-123456";

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
      <div className="glass max-w-2xl w-full p-8 sm:p-12 text-center  shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20  blur-3xl pointer-events-none" />

        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10  mb-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>

        <h1 className="text-4xl font-black text-white tracking-tight mb-4">
          Order Confirmed!
        </h1>

        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Thank you for shopping with Hardware Store. Your order has been
          securely processed and is being prepared for shipment via Posten.
        </p>

        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 bg-dark-bg/50 border border-dark-border py-4 px-8  mb-10 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <Package className="w-5 h-5" /> Order Number:
          </div>
          <div className="font-mono text-2xl font-bold text-amber-500 ">
            {orderNumber}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold  transition-all shadow-lg hover:shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-dark-surface hover:bg-dark-surface/80 border border-dark-border text-gray-300 font-medium  transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-10">
          A confirmation receipt will be sent to your email shortly. For
          support, please reference your order number.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white font-bold animate-pulse">
          Loading Confirmation...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
