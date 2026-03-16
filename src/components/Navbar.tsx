"use client";

import Link from 'next/link';
import { Cpu, ShoppingCart, Search } from 'lucide-react';
import { CartSidebar } from '@/components/CartSidebar';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { mode, cart, buildSystem, setMode } = useStore();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Cpu className="h-8 w-8 text-brand-500" />
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-brand-500 to-amber-400 bg-clip-text text-transparent">
                Hardware Store
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search components..." 
                className="block w-full pl-10 pr-3 py-2 border border-dark-border leading-5 bg-dark-bg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm font-medium">
            <button onClick={() => { setMode('loose'); router.push('/catalog'); }} className="text-gray-300 hover:text-white transition-colors">Catalog</button>
            <button onClick={() => { setMode('build'); router.push('/catalog'); }} className="text-gray-300 hover:text-white transition-colors">PC Builder</button>
          </div>
        </div>
      </div>
      <CartSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </nav>
  )
}
