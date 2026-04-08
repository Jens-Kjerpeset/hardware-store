import { AdminNavigation } from '@/components/admin/AdminNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavigation />
      {/* 
        We are keeping zero-margin constraints inside the nested modules, 
        but bounding the root admin structure fluidly over 1536px 
      */}
      <div className="flex-1 w-full mx-auto px-4 lg:px-8 border-l border-r border-border max-w-screen-2xl">
        {children}
      </div>
    </div>
  );
}
