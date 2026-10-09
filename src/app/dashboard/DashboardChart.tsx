'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardChart({ rawData }: { rawData: { date: string, count: number }[] }) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  // Filter data based on time range
  const now = new Date();
  const filterDate = new Date();
  filterDate.setDate(now.getDate() - parseInt(timeRange));
  
  const filteredData = rawData.filter(d => new Date(d.date) >= filterDate);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Submissions Over Time</h2>
          <p className="text-sm text-gray-500 mt-1">Testimonials collected across all spaces</p>
        </div>
        <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setTimeRange('7')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${timeRange === '7' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            7d
          </button>
          <button 
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${timeRange === '30' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            30d
          </button>
          <button 
            onClick={() => setTimeRange('90')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${timeRange === '90' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            90d
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {filteredData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
            <p className="text-gray-500">Not enough data to display chart.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
