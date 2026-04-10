import Link from 'next/link';
import HardwareStoreGame from '@/components/game/HardwareStoreGame';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';

export default function HardwareStorePage() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col md:pt-8 md:px-4 [@media(max-height:500px)]:!pt-0 [@media(max-height:500px)]:!px-0 text-zinc-100 overflow-hidden">
      
      {/* Mobile Portrait Orientation Lock - Forces landscape */}
      <div className="fixed inset-0 z-[200] bg-zinc-950 flex-col items-center justify-center p-8 text-center flex portrait:flex landscape:hidden md:!hidden backdrop-blur-xl">
         <RotateCcw className="w-16 h-16 text-brand mb-6 animate-pulse mx-auto" />
         <h2 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">Rotate Device</h2>
         <p className="text-zinc-400">Please rotate your phone to landscape mode to play.</p>
         <Link href="/" className="mt-8 px-6 py-3 border border-zinc-700/50 rounded-lg text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors inline-block">
            Exit
         </Link>
      </div>

      {/* Floating Exit Button natively embedded solely for Mobile Landscape */}
      <Link href="/" className="md:hidden absolute top-4 right-4 z-[150] bg-black/60 border border-zinc-800 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-black/80 transition-colors outline-none shadow-lg backdrop-blur-md">
          <X className="w-5 h-5" />
      </Link>

      <div className="max-w-4xl mx-auto w-full mb-8 hidden md:flex items-center justify-between gap-4 [@media(max-height:500px)]:!hidden [@media(max-height:500px)]:!mb-0 shrink-0">
         <div>
            <h1 className="text-3xl font-black tracking-widest text-brand uppercase">Hardware Store</h1>
            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Endurance Run</p>
         </div>
         <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-surface border border-border px-4 py-2 rounded-lg font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Return to Store
         </Link>
      </div>

      <HardwareStoreGame />
    </div>
  );
}
