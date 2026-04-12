'use client';

import { useState, useTransition } from 'react';
import { updateTrackingNumber } from '@/app/actions/admin/orders';
import { Loader2, Check } from 'lucide-react';

interface OrderTrackingInputProps {
  orderId: string;
  initialTrackingNumber: string | null;
}

export function OrderTrackingInput({ orderId, initialTrackingNumber }: OrderTrackingInputProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setErrorLine('');
    setSaved(false);
    startTransition(async () => {
      const result = await updateTrackingNumber(orderId, trackingNumber);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setErrorLine(result.error || 'Failed to update tracking number');
      }
    });
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-zinc-500 tracking-widest mb-2">Tracking Number</label>
      <div className="flex items-center gap-2">
        <input 
          type="text" 
          value={trackingNumber} 
          onChange={(e) => setTrackingNumber(e.target.value)} 
          placeholder="e.g. 1Z9999999999999999"
          disabled={isPending}
          className="w-full bg-background border border-border  px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
        />
        <button 
          onClick={handleSave}
          disabled={isPending || trackingNumber === (initialTrackingNumber || '')}
          className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 text-white px-4 py-2  text-sm font-bold flex items-center justify-center gap-2 min-w-[80px] transition-colors"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-400" /> : 'Save'}
        </button>
      </div>
      {errorLine && <p className="text-red-400 text-xs mt-2">{errorLine}</p>}
    </div>
  );
}
