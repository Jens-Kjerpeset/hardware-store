"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ImageMapper() {
  const [images, setImages] = useState<string[]>([]);
  const [products, setProducts] = useState<{id:string, name:string}[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/map-images').then(r => r.json()).then(data => {
      setImages(data.images);
      setProducts(data.products);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/admin/map-images', { method: 'POST', body: JSON.stringify(mapping) });
    alert('Images strictly re-mapped to database automatically! V4 cache bust activated.');
    setLoading(false);
  };

  return (
    <div className="p-8">
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-black text-white">Visual Image Mapper</h1>
         <button 
           onClick={handleSave} 
           disabled={loading}
           className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-6 shadow-lg shadow-brand-500/20"
         >
           {loading ? "Saving..." : "Lock In Selections"}
         </button>
       </div>
       <p className="text-gray-400 mb-8">Because many original filenames were shifted and unrecognizable to AI, manually lock them to their correct database definitions here. Only the dropdowns you change will be remapped!</p>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {images.map(img => (
           <div key={img} className="bg-dark-surface border border-dark-border p-4 flex flex-col items-center gap-4">
             <div className="w-full aspect-square relative bg-dark-bg p-4 flex items-center justify-center border border-dark-border/50">
               <img src={`/products/${img}`} className="w-full h-full object-contain" />
             </div>
             <p className="text-xs text-gray-500 font-mono break-all text-center">{img.replace('_FINAL.png', '')}</p>
             <select 
               className="w-full bg-dark-bg border border-dark-border text-white p-2 text-sm focus:border-brand-500 outline-none"
               onChange={e => setMapping({...mapping, [img]: e.target.value})}
             >
               <option value="">-- Reassign to product --</option>
               {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
         ))}
       </div>
    </div>
  )
}
