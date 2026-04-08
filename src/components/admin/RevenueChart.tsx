'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#a1a1aa" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
            dx={-10}
          />
          <Tooltip 
            formatter={(value: any) => [formatCurrency(value), "Revenue"]}
            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
            contentStyle={{ 
              backgroundColor: '#171717', 
              borderColor: '#262626', 
              color: '#e5e5e5',
              borderRadius: '8px',
              padding: '12px'
            }} 
            itemStyle={{ color: 'var(--color-brand)' }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--color-brand)" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#171717' }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#171717' }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
