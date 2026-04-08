import { BuilderSidebar } from "@/components/BuilderSidebar";
import { LooseCartSidebar } from "@/components/LooseCartSidebar";
import { ModeSync } from "@/components/ModeSync";
import { MobileCartToolbar } from "@/components/MobileCartToolbar";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] items-start pb-24 lg:pb-0 relative">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 pr-0 lg:pr-6">
        {children}
      </div>

      {/* Persistent Sidebars (Conditionally Rendered via internal Zustand state) */}
      <BuilderSidebar />
      <LooseCartSidebar />
      <MobileCartToolbar />
      <ModeSync />
    </div>
  );
}
