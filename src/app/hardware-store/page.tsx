import Link from 'next/link';
import HardwareStoreGame from '@/components/game/HardwareStoreGame';
import { ArrowLeft } from 'lucide-react';

export default function HardwareStorePage() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col pt-8 px-4 text-zinc-100 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-black tracking-widest text-brand uppercase">Hardware Store</h1>
            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Endurance Run (3:43)</p>
         </div>
         <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-surface border border-border px-4 py-2 rounded-lg font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Return to Store
         </Link>
      </div>

      <HardwareStoreGame />
    </div>
  );
}
