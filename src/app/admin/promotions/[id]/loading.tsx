export default function Loading() {
  return (
    <div className="flex flex-col w-full py-8 text-zinc-100 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
         <div className="w-5 h-5 bg-background border border-border animate-pulse" />
         <div>
           <div className="w-48 h-8 bg-background border border-border animate-pulse mb-2" />
           <div className="w-64 h-4 bg-background border border-border animate-pulse" />
         </div>
      </div>
    
      {/* Form Skeleton */}
      <div className="space-y-8 w-full max-w-4xl opacity-50">
          
          {/* General Information */}
          <div className="bg-surface border border-border p-6 space-y-6">
             <div className="w-48 h-6 bg-background border border-border animate-pulse mb-2" />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <div className="w-24 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-background border border-border animate-pulse" />
               </div>
    
               <div className="flex items-center gap-3 pt-6 md:pl-4">
                 <div className="w-4 h-4 bg-background border border-border animate-pulse" />
                 <div className="w-12 h-4 bg-background border border-border animate-pulse" />
               </div>
             </div>
          </div>
    
          {/* Value & Constraints */}
          <div className="bg-background border border-border p-6 space-y-6">
             <div className="w-48 h-6 bg-background border border-border animate-pulse mb-2" />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <div className="w-24 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-surface border border-border animate-pulse" />
               </div>
    
               <div>
                 <div className="w-32 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-surface border border-border animate-pulse" />
               </div>
    
               <div className="md:col-span-2">
                 <div className="w-64 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-surface border border-border animate-pulse" />
               </div>
    
               <div className="md:col-span-2 space-y-2 pt-2 border-t border-border mt-2">
                 <div className="w-48 h-4 bg-background border border-border animate-pulse mb-2 mt-2" />
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-surface p-4 border border-border">
                   {[...Array(6)].map((_, i) => (
                     <div key={i} className="flex items-center gap-2">
                       <div className="w-4 h-4 bg-background border border-border animate-pulse shrink-0" />
                       <div className="w-20 h-4 bg-background border border-border animate-pulse" />
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
    
          {/* Limits & Scheduling */}
          <div className="bg-surface border border-border p-6 space-y-6">
             <div className="w-48 h-6 bg-background border border-border animate-pulse mb-2" />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <div className="w-48 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-background border border-border animate-pulse" />
               </div>
               
               <div>
                 <div className="w-24 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-background border border-border animate-pulse" />
               </div>
             </div>
          </div>
          
          <div className="flex justify-end pt-4 pb-24">
             <div className="w-48 h-12 bg-background border border-border animate-pulse" />
          </div>
    
      </div>
    </div>
  );
}
