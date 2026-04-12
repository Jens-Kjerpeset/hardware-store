"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, Shield, Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background relative z-50">
      <div className="max-w-[1920px] w-full mx-auto px-2 md:px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Admin Badge */}
        <div className="flex items-center gap-2 sm:gap-6 shrink">
          <Link href="/" className="flex items-center gap-2 font-bold group shrink-0">
            <Cpu className="w-5 h-5 md:w-6 md:h-6 text-brand" />
            <span className="text-lg md:text-xl text-white group-hover:text-brand transition-colors whitespace-nowrap">
              Hardware Store
            </span>
          </Link>
          
          <Link 
            href="/admin" 
            className="hidden min-[400px]:flex items-center gap-1.5 px-2.5 py-1  bg-red-950/30 text-xs font-semibold text-red-500 border border-red-900/50 hover:bg-red-950/50 transition-colors shrink-0"
            title="Shielded administration panel"
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/catalog?builder=false" className="hover:text-white transition-colors">
            Catalog
          </Link>
          <Link href="/catalog?builder=true" className="hover:text-white transition-colors">
            PC Builder
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="flex md:hidden text-zinc-400 hover:text-white transition-colors p-2 shrink-0 group"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-border bg-surface md:hidden flex flex-col px-4 py-4 space-y-4 ">
          <Link 
            href="/catalog?builder=false" 
            className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Catalog
          </Link>
          <Link 
            href="/catalog?builder=true" 
            className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            PC Builder
          </Link>
          
          <div className="pt-2 border-t border-border">
            <Link 
              href="/admin" 
              className="flex items-center p-3  bg-red-950/20 text-sm font-semibold text-red-400 border border-red-900/30 hover:bg-red-950/40 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
