"use client";

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { updateProduct, deleteProduct, createProduct } from '@/app/actions/admin';
import { Edit2, Save, X, Trash2, CheckCircle2, ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  brand: string;
  description: string;
  specsJson: string;
  imageUrl: string;
  categoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
  category: { id: string; name: string };
}

const CATEGORY_SPECS: Record<string, { key: string; label: string; type: 'text' | 'number'; }[]> = {
  'CPU': [
    { key: 'socket', label: 'Socket', type: 'text' },
    { key: 'cores', label: 'Cores', type: 'number' },
    { key: 'speedGhz', label: 'Speed (GHz)', type: 'number' },
    { key: 'tdp', label: 'TDP (W)', type: 'number' }
  ],
  'Motherboard': [
    { key: 'socket', label: 'Socket', type: 'text' },
    { key: 'formFactor', label: 'Form Factor', type: 'text' },
    { key: 'chipset', label: 'Chipset', type: 'text' },
    { key: 'memoryType', label: 'Memory Type', type: 'text' },
    { key: 'memorySlots', label: 'Memory Slots', type: 'number' },
    { key: 'maxMemory', label: 'Max Memory (GB)', type: 'number' }
  ],
  'RAM': [
    { key: 'memoryType', label: 'Memory Type', type: 'text' },
    { key: 'capacity', label: 'Capacity (GB)', type: 'number' },
    { key: 'speed', label: 'Speed (MHz)', type: 'number' },
    { key: 'casLatency', label: 'CAS Latency', type: 'number' },
    { key: 'modules', label: 'Modules (e.g. 2x16GB)', type: 'text' }
  ],
  'GPU': [
    { key: 'chipset', label: 'Chipset', type: 'text' },
    { key: 'memory', label: 'Memory (GB)', type: 'number' },
    { key: 'formFactor', label: 'Form Factor', type: 'text' },
    { key: 'lengthMm', label: 'Length (mm)', type: 'number' },
    { key: 'recommendedPsu', label: 'Rec. PSU (W)', type: 'number' }
  ],
  'Power Supply': [
    { key: 'wattage', label: 'Wattage (W)', type: 'number' },
    { key: 'formFactor', label: 'Form Factor', type: 'text' },
    { key: 'modular', label: 'Modular (Full/Semi/Non)', type: 'text' },
    { key: 'efficiency', label: 'Efficiency', type: 'text' }
  ],
  'Case': [
    { key: 'formFactor', label: 'Form Factor', type: 'text' },
    { key: 'maxMainboard', label: 'Max Mainboard', type: 'text' },
    { key: 'color', label: 'Color', type: 'text' },
    { key: 'sidePanel', label: 'Side Panel', type: 'text' }
  ],
  'Storage': [
    { key: 'formFactor', label: 'Form Factor', type: 'text' },
    { key: 'capacity', label: 'Capacity (GB)', type: 'number' },
    { key: 'storageType', label: 'Type (HDD/SSD)', type: 'text' },
    { key: 'interface', label: 'Interface', type: 'text' },
    { key: 'rpm', label: 'RPM (If HDD)', type: 'number' },
    { key: 'readSpeed', label: 'Read Speed (MB/s)', type: 'number' },
    { key: 'writeSpeed', label: 'Write Speed (MB/s)', type: 'number' }
  ],
  'CPU Cooler': [
    { key: 'coolerType', label: 'Type (Liquid/Air)', type: 'text' },
    { key: 'radiatorSize', label: 'Radiator Size (mm)', type: 'number' },
    { key: 'height', label: 'Height (mm)', type: 'number' },
    { key: 'color', label: 'Color', type: 'text' }
  ]
};

export function InventoryTable({ 
  initialProducts, 
  categories 
}: { 
  initialProducts: Product[],
  categories: {id: string; name: string}[]
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Group products by category
  const grouped = products.reduce((acc, p) => {
    const cat = p.category.name;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  const allCategories = Object.keys(grouped).sort();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [allCategories[0]]: true
  });

  const toggleCategory = (cat: string) => {
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Unified Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = {
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 10,
    brand: '',
    categoryId: '',
    imageUrl: '/placeholder.jpg',
    dynamicSpecs: {} as Record<string, any>
  };
  const [productForm, setProductForm] = useState(emptyForm);

  const openAddModal = () => {
    setProductForm(emptyForm);
    setModalStep(1);
    setModalMode('add');
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    let parsedSpecs = {};
    try {
      if (p.specsJson) {
        parsedSpecs = JSON.parse(p.specsJson);
        delete (parsedSpecs as any).type;
      }
    } catch(e) {}

    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      brand: p.brand,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl,
      dynamicSpecs: parsedSpecs
    });
    setModalStep(2); // Jump straight to details
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      const result = await deleteProduct(id);
      if (result.success) {
         setProducts(products.filter(p => p.id !== id));
      } else {
         alert("Failed to delete product.");
      }
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Convert local component state into backend-ready Prisma payload
    const activeCategory = categories.find(c => c.id === productForm.categoryId);
    const categoryName = activeCategory?.name || '';
    const builtSpecs = {
      type: categoryName.toLowerCase().replace(' ', '_'),
      ...productForm.dynamicSpecs
    };

    const payload = {
      ...productForm,
      specsJson: JSON.stringify(builtSpecs)
    };
    delete (payload as any).dynamicSpecs;

    if (modalMode === 'add') {
      const result = await createProduct(payload as any);
      if (result.success && result.product) {
        const catObj = categories.find(c => c.id === result.product!.categoryId) || { id: 'unknown', name: 'Unknown' };
        const newLocalProduct = { ...(result.product as any), category: catObj } as Product;
        setProducts([...products, newLocalProduct]);
        closeModal();
      } else {
        alert("Failed to create product.");
      }
    } else if (modalMode === 'edit' && editingId) {
      const result = await updateProduct(editingId, payload as any);
      if (result.success) {
        // Optimistically update the local row
        let catObj = activeCategory;
        if (!catObj) catObj = { id: 'unknown', name: 'Unknown' };
        
        setProducts(products.map(p => 
          p.id === editingId ? { ...p, ...payload, category: catObj } as Product : p
        ));
        
        setSaveSuccess(editingId);
        setTimeout(() => setSaveSuccess(null), 2000);
        closeModal();
      } else {
        alert("Failed to update product.");
      }
    }
    
    setIsSaving(false);
  };

  return (
    <>
      <div className="flex justify-end mb-4 -mt-16 relative z-10">
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded shadow-lg transition-colors text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="space-y-4">
        {allCategories.map((cat) => {
        const catProducts = grouped[cat];
        const isExpanded = !!expanded[cat];
        
        // Calculate category summary
        const totalItems = catProducts.length;
        const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);

        return (
          <div key={cat} className="glass rounded-xl border border-dark-border overflow-hidden bg-dark-surface/30">
            {/* Header / Accordion Toggle */}
            <button 
              onClick={() => toggleCategory(cat)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <h3 className="text-lg font-bold text-white tracking-tight uppercase">{cat}</h3>
                <span className="bg-dark-bg border border-dark-border text-gray-400 text-xs px-2 py-0.5 rounded-full font-mono">
                  {totalItems} products
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                 <div className="flex flex-col items-end">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Stock</span>
                  <span className="text-brand-400 font-mono font-bold">{totalStock} units</span>
                </div>
              </div>
            </button>

            {/* Expanded Table Content */}
            {isExpanded && (
              <div className="border-t border-dark-border/50 bg-dark-bg/50">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 bg-dark-surface/50 uppercase border-b border-dark-border">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold w-24">Stock</th>
                        <th className="px-4 py-3 font-semibold">Cost (Internal)</th>
                        <th className="px-4 py-3 font-semibold">Retail Price</th>
                        <th className="px-4 py-3 font-semibold">Margin</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catProducts.map((p) => {
                        const currentMargin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;

                        return (
                          <tr key={p.id} className="border-b border-dark-border/30 hover:bg-white/5 transition-colors group">
                            
                            <td className="px-4 py-3 text-gray-200">
                               <span className="line-clamp-1">{p.name}</span>
                            </td>

                            <td className="px-4 py-3">
                                <span className={`font-mono font-bold ${p.stock <= 5 ? 'text-rose-400' : 'text-gray-300'}`}>
                                  {p.stock}
                                </span>
                            </td>

                            <td className="px-4 py-3">
                               <span className="font-mono text-gray-400">{formatCurrency(p.cost)}</span>
                            </td>

                            <td className="px-4 py-3">
                               <span className="font-mono font-bold text-brand-400">{formatCurrency(p.price)}</span>
                            </td>

                            <td className="px-4 py-3 font-mono text-xs">
                                <span className={currentMargin < 15 ? 'text-rose-400' : 'text-emerald-400'}>{currentMargin.toFixed(1)}%</span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {saveSuccess === p.id && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in spin-in-180 duration-300" />}
                                
                                <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors opacity-0 group-hover:opacity-100" title="Edit Product">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete Product">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-4xl rounded-xl border border-dark-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-dark-surface/50 shrink-0">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'add' 
                    ? (modalStep === 1 ? 'Step 1: Select Category' : 'Step 2: Product Details')
                    : 'Edit Product Details'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              {modalStep === 1 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setProductForm({ ...productForm, categoryId: c.id, dynamicSpecs: {} });
                        setModalStep(2);
                      }}
                      className="glass aspect-square rounded-xl border border-dark-border hover:border-brand-500 hover:bg-brand-500/10 flex flex-col items-center justify-center p-4 transition-all text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-dark-surface/50 mb-3 group-hover:bg-brand-500/20 transition-colors flex items-center justify-center">
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-400" />
                      </div>
                      <span className="font-bold text-gray-200 group-hover:text-white">{c.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="text-brand-400 font-bold uppercase tracking-wider text-sm">General Information</h3>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                      <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="e.g. NVIDIA RTX 4090" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                      <textarea required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500 h-20 resize-none" placeholder="Product details..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</label>
                        <input required type="text" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="e.g. ASUS" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                         {modalMode === 'add' ? (
                           <div className="w-full bg-dark-surface/50 border border-dark-border rounded px-3 py-2 text-gray-400 uppercase text-sm font-bold flex justify-between items-center cursor-not-allowed">
                              {categories.find(c => c.id === productForm.categoryId)?.name}
                           </div>
                         ) : (
                           <select required value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value, dynamicSpecs: {}})} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-bold uppercase text-sm">
                             {categories.map(c => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                             ))}
                           </select>
                         )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Internal Cost</label>
                        <input required type="number" value={productForm.cost || ''} onChange={e => setProductForm({...productForm, cost: parseFloat(e.target.value) || 0})} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono" placeholder="0" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Retail Price</label>
                        <input required type="number" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono" placeholder="0" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Level</label>
                        <input required type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono" />
                      </div>
                    </div>
                  </div>

                  <hr className="border-dark-border" />

                  <div className="space-y-4">
                    <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                      Technical Specifications 
                      <span className="bg-dark-bg px-2 py-0.5 rounded-full text-[10px] text-gray-400">Dynamic</span>
                    </h3>
                    
                    {(() => {
                      const catName = categories.find(c => c.id === productForm.categoryId)?.name || '';
                      const specFields = CATEGORY_SPECS[catName] || [];

                      if (specFields.length === 0) {
                        return <p className="text-gray-500 text-sm">No specialized filters required for this category.</p>
                      }

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {specFields.map(field => (
                            <div key={field.key} className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{field.label}</label>
                              <input 
                                type={field.type} 
                                value={productForm.dynamicSpecs[field.key] || ''} 
                                onChange={e => {
                                  const val = field.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value;
                                  setProductForm(prev => ({
                                    ...prev, 
                                    dynamicSpecs: { ...prev.dynamicSpecs, [field.key]: val }
                                  }));
                                }}
                                className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500" 
                                placeholder={field.type === 'number' ? '0' : '...'}
                              />
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>

                  <div className="pt-4 flex justify-between gap-3 border-t border-dark-border/50 mt-6 pt-6 -mx-6 px-6 bg-dark-surface/30">
                    <div>
                      {modalMode === 'add' && (
                        <button type="button" onClick={() => setModalStep(1)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                          &larr; Back to Categories
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={isSaving} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded shadow-lg transition-colors text-sm">
                        {isSaving ? 'Saving...' : (modalMode === 'add' ? 'Create Product' : 'Save Changes')}
                      </button>
                    </div>
                  </div>

                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
