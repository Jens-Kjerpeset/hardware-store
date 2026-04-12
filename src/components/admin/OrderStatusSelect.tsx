'use client';

import { useTransition, useState } from 'react';
import { updateOrderStatus } from '@/app/actions/admin/orders';
import { Loader2 } from 'lucide-react';

interface Props {
  orderId: string;
  type: 'status' | 'shippingStatus';
  currentValue: string;
  options: { label: string; value: string }[];
}

export function OrderStatusSelect({ orderId, type, currentValue, options }: Props) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(currentValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    startTransition(async () => {
      await updateOrderStatus(orderId, type, newValue);
    });
  };

  return (
    <div className="relative flex items-center min-w-[140px]">
      <select
        value={value}
        onChange={handleChange}
        disabled={isPending}
        className="appearance-none bg-background border border-border  px-3 py-1.5 pr-8 text-sm w-full focus:outline-none focus:border-brand transition-colors disabled:opacity-50 text-white font-medium capitalize"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {isPending ? (
        <div className="absolute right-2 pointer-events-none">
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
        </div>
      ) : (
        <div className="absolute right-2 pointer-events-none border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-zinc-400 mt-0.5"></div>
      )}
    </div>
  );
}
