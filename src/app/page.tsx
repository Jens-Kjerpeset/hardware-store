import Link from "next/link";
import { Cpu, Wrench } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Welcome to <span className="text-brand">Hardware Store</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
          Buy PC parts. Individual components or full system validation.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-border  text-sm text-zinc-400">
          Press <kbd className="font-mono bg-surface px-1 py-0.5  text-xs border border-border text-zinc-300">⌘ CMD</kbd> + <kbd className="font-mono bg-surface px-1 py-0.5  text-xs border border-border text-zinc-300">D</kbd> to Bookmark
        </div>
      </div>

      {/* Choice Grid */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Catalog Card */}
        <Link href="/catalog?builder=false" className="group border border-border bg-surface hover:bg-surface-hover hover:border-zinc-700 transition-all  overflow-hidden flex flex-col">
          <div className="p-6 space-y-4 flex-1">
            <div className="w-12 h-12  bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-white">Component Catalog</h2>
              <p className="text-zinc-400 leading-relaxed">
                Search for standalone parts. Filter by specs, socket, and dimensions.
              </p>
            </div>
          </div>
          <div className="p-6 pt-0 mt-auto">
            <span className="inline-flex font-medium text-white group-hover:text-brand transition-colors">
              Shop Catalog →
            </span>
          </div>
        </Link>

        {/* Builder Card */}
        <Link href="/catalog?builder=true" className="group border border-border bg-surface hover:bg-surface-hover hover:border-brand/40 transition-all  overflow-hidden flex flex-col relative ring-1 ring-transparent hover:ring-brand/20  /5">
          <div className="p-6 space-y-4 flex-1">
            <div className="w-12 h-12  bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-white">System Builder</h2>
              <p className="text-zinc-400 leading-relaxed">
                Draft a complete build. The picker checks basic socket compatibility, physical clearances, and wattage draw.
              </p>
            </div>
          </div>
          <div className="p-6 pt-0 mt-auto">
            <span className="inline-flex font-medium text-brand hover:text-brand-hover transition-colors">
              Enter PC Builder →
            </span>
          </div>
        </Link>
      </div>
      
      {/* Footer Text (Hidden for Prod Release) */}
      <div className="pt-4 text-zinc-400 text-sm">
        <Link href="/hardware-store" className="underline decoration-zinc-700 underline-offset-4 cursor-pointer hover:text-zinc-300 transition-colors">
          I don't care about "cOmPuTeR hArDwArE", I'm here for the Hardware Store!!
        </Link>
      </div>
    </div>
  );
}
