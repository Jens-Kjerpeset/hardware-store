'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function ExpenditureChart({ data }: { data: any[] }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            className="capitalize"
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
            formatter={(value: any) => [formatCurrency(value), "Expenditure"]}
            labelStyle={{ color: '#a1a1aa', marginBottom: '4px', textTransform: 'capitalize' }}
            contentStyle={{ 
              backgroundColor: '#171717', 
              borderColor: '#262626', 
              color: '#e5e5e5',
              borderRadius: '8px',
              padding: '12px'
            }} 
            itemStyle={{ color: '#ef4444' }}
            cursor={{ fill: '#27272a', opacity: 0.4 }}
          />
          <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
