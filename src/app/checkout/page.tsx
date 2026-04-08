import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Secure Checkout | Hardware Store',
  description: 'Finalize your hardware build sequence.',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Abort & Return to Catalog
          </Link>
        </div>

        
        <CheckoutForm />
      </div>
    </div>
  );
}
