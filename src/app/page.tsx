"use client";

import { useStore } from "@/lib/store";
import { Cpu, Wrench, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const setMode = useStore((state) => state.setMode);
  const router = useRouter();

  const handleModeSelect = (mode: "loose" | "build", path: string) => {
    setMode(mode);
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent tracking-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-brand-500 to-amber-400 bg-clip-text text-transparent">
            Hardware Store
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
          Whether you&apos;re upgrading a single component or forging an
          entirely new rig from scratch, we have the arsenal you need.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Loose Parts Mode */}
        <button
          onClick={() => handleModeSelect("loose", "/catalog")}
          className="group relative flex flex-col h-full glass p-8 border border-dark-border hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="h-16 w-16 bg-dark-surface flex items-center justify-center mb-6 border border-dark-border group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-colors">
            <Cpu className="w-8 h-8 text-gray-400 group-hover:text-brand-400 transition-colors" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Browse Loose Parts
          </h2>
          <p className="text-gray-400 mb-8 flex-1 text-lg">
            Looking for a specific upgrade? Browse our massive catalog of
            individual components and add them directly to your cart.
          </p>

          <div className="flex items-center text-brand-400 font-bold group-hover:translate-x-2 transition-transform">
            Shop Catalog <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </button>

        {/* Build a System Mode */}
        <button
          onClick={() => handleModeSelect("build", "/catalog")}
          className="group relative flex flex-col h-full glass p-8 border border-dark-border hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="h-16 w-16 bg-dark-surface flex items-center justify-center mb-6 border border-dark-border group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-colors">
            <Wrench className="w-8 h-8 text-gray-400 group-hover:text-amber-400 transition-colors" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Build a System</h2>
          <p className="text-gray-400 mb-8 flex-1 text-lg">
            Select parts for a complete custom rig. Our intelligent engine will
            verify compatibility and ensure you aren&apos;t missing any crucial
            components.
          </p>

          <div className="flex items-center text-amber-500 font-bold group-hover:translate-x-2 transition-transform">
            Enter PC Builder <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </button>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/the-hardware-store"
          className="text-gray-500 hover:text-brand-400 text-sm underline underline-offset-4 transition-colors"
        >
          I don&apos;t care about &quot;cOmPuTeR hArDwArE&quot;, I&apos;m here
          for the Hardware Store!!
        </Link>
      </div>
    </div>
  );
}
