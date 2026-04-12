import Link from "next/link";
import { Cpu, CircuitBoard, MemoryStick, MonitorPlay, PlugZap, Server, HardDrive, Fan, Disc, Grid2x2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

const ICON_MAP: Record<string, React.ReactNode> = {
  "Cpu": <Cpu className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "CircuitBoard": <CircuitBoard className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "MemoryStick": <MemoryStick className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "MonitorPlay": <MonitorPlay className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "PlugZap": <PlugZap className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "Server": <Server className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "HardDrive": <HardDrive className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "Fan": <Fan className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
  "Disc": <Disc className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />,
};

export default async function CatalogPage() {
  // Use Prisma to fetch actual categories from the database structure
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="bg-[#2D1610]  py-8 px-4 md:p-12 text-center mb-6 md:mb-10  border border-[#402015]">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight text-balance">
          Select a Component Category
        </h1>
        <p className="text-[#B38D82] mt-2 md:mt-4 text-sm md:text-base text-pretty max-w-[280px] md:max-w-none mx-auto">
          Pick a category to select a part for your system build.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {categories.map((category: { id: string; name: string; icon: string; description: string | null }) => (
          <Link 
            key={category.id} 
            href={`/catalog/${encodeURIComponent(category.name.toLowerCase().replace(/ /g, '-'))}`}
            className="flex flex-col items-center justify-center p-4 md:p-8 bg-[#0a0a0a] border border-border  hover:bg-surface hover:border-zinc-700 transition-all text-center group"
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
               {ICON_MAP[category.icon] || <Grid2x2 className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-zinc-300" />}
            </div>
            <h2 className="text-base md:text-xl font-bold text-white mb-1 md:mb-2 group-hover:text-brand transition-colors text-balance">
              {category.name}
            </h2>
            <p className="hidden sm:block text-xs md:text-sm text-zinc-400 line-clamp-2">
              {category.description || `Browse our selection of ${category.name}s.`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
