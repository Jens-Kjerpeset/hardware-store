"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { useStore } from "@/lib/store";

interface CategoryClientProps {
  categories: {
    id: string;
    name: string;
    icon: string;
    description: string | null;
  }[];
}

export default function CategoryHubClient({ categories }: CategoryClientProps) {
  const { mode } = useStore();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="relative w-full h-48 overflow-hidden glass border-brand-500/20 shadow-2xl shadow-brand-500/10 flex items-center justify-center group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/40 via-purple-900/40 to-dark-bg z-0" />
        <div className="absolute -inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
        <div className="relative z-10 text-center space-y-2 px-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent pb-2">
            Select a Component Category
          </h1>
          <p className="text-brand-100/80 font-medium">
            {mode === "build"
              ? "Pick a category to select a part for your system build."
              : "Browse parts by category."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {categories.map((cat) => {
          const iconRef = cat.icon || "LayoutGrid";
          const isUrl = iconRef.startsWith("/") || iconRef.startsWith("http");
          const IconComp = (!isUrl
            ? LucideIcons[iconRef as keyof typeof LucideIcons] || LucideIcons.LayoutGrid
            : LucideIcons.LayoutGrid) as any;

          return (
            <Link
              href={`/catalog/${encodeURIComponent(cat.name)}`}
              key={cat.id}
              className="group"
            >
              <div className="glass p-8 flex flex-col items-center justify-center gap-4 border border-dark-border hover:border-brand-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] transition-all duration-300 h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {isUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={iconRef}
                    alt={cat.name}
                    className="w-16 h-16 object-contain z-10 drop-shadow-md opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <IconComp className="w-16 h-16 text-gray-500 group-hover:text-brand-400 transition-colors drop-shadow-md z-10" />
                )}

                <div className="text-center z-10">
                  <h2 className="text-xl font-bold text-white mb-1 group-hover:text-brand-300 transition-colors">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
