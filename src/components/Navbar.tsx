/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { Cpu, ShieldAlert } from "lucide-react";
import { CartSidebar } from "@/components/CartSidebar";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { mode, setMode } = useStore();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-1 items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Cpu className="h-8 w-8 text-brand-500" />
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-brand-500 to-amber-400 bg-clip-text text-transparent hidden sm:inline-block">
                Hardware Store
              </span>
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-bold   text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5  transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </Link>
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => {
                setMode("loose");
                router.push("/catalog");
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Catalog
            </button>
            <button
              onClick={() => {
                setMode("build");
                router.push("/catalog");
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              PC Builder
            </button>
          </div>
        </div>
      </div>
      <CartSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </nav>
  );
}
