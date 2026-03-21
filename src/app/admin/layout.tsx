import { ShieldCheck } from "lucide-react";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="bg-dark-surface border-b border-dark-border py-4">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2 text-rose-400">
              <ShieldCheck className="w-6 h-6" /> Admin Control Panel
            </h1>

            <AdminNav />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
