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
          
          {/* Primary Details */}
          <div className="bg-surface border border-border p-6 space-y-6">
             <div className="w-48 h-6 bg-background border border-border animate-pulse mb-2" />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Product Name */}
               <div>
                 <div className="w-24 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-background border border-border animate-pulse" />
               </div>
               
               {/* Brand */}
               <div>
                 <div className="w-16 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-background border border-border animate-pulse" />
               </div>
    
               {/* Description */}
               <div className="md:col-span-2">
                 <div className="w-24 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-24 bg-background border border-border animate-pulse" />
               </div>
    
               {/* Image URL */}
               <div>
                 <div className="w-24 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="flex gap-3">
                   <div className="w-12 h-12 shrink-0 bg-background border border-border animate-pulse" />
                   <div className="w-full h-10 mt-1 bg-background border border-border animate-pulse" />
                 </div>
               </div>
    
               {/* SKU */}
               <div>
                 <div className="w-12 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-background border border-border animate-pulse" />
               </div>
    
               {/* Category */}
               <div>
                 <div className="w-32 h-4 bg-background border border-border animate-pulse mb-2" />
                 <div className="w-full h-10 bg-background border border-border animate-pulse" />
               </div>
    
               {/* Active */}
               <div className="flex items-center gap-3 pt-6">
                 <div className="w-4 h-4 bg-background border border-border animate-pulse" />
                 <div className="w-12 h-4 bg-background border border-border animate-pulse" />
               </div>
             </div>
          </div>
    
          {/* Pricing & Inventory */}
          <div className="bg-surface border border-border p-6 space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
               <div className="w-48 h-6 bg-background border border-border animate-pulse" />
               <div className="w-32 h-6 bg-background border border-border animate-pulse" />
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i}>
                   <div className="w-20 h-4 bg-background border border-border animate-pulse mb-2" />
                   <div className="w-full h-10 bg-background border border-border animate-pulse" />
                 </div>
               ))}
             </div>
          </div>
    
          {/* Dynamic Specification Engine */}
          <div className="bg-surface border border-border p-6 space-y-6">
             <div className="w-56 h-6 bg-background border border-border animate-pulse mb-2" />
             <div className="w-72 h-3 bg-background border border-border animate-pulse mb-4" />
             
             <div className="bg-background border border-border p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i}>
                   <div className="w-32 h-4 bg-surface border border-border animate-pulse mb-2" />
                   <div className="w-full h-10 bg-surface border border-border animate-pulse" />
                 </div>
               ))}
             </div>
          </div>
          
          <div className="flex justify-end pt-4 pb-24">
             <div className="w-40 h-12 bg-background border border-border animate-pulse" />
          </div>
    
      </div>
    </div>
  );
}
