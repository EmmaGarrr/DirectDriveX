"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { UploadActivityData } from '@/types/admin';

interface UploadActivityChartProps {
  data?: UploadActivityData[];
  loading?: boolean;
}

// Default data for preview/empty state
const defaultData = [
  { day: '2023-06-01', uploads: 400 },
  { day: '2023-06-02', uploads: 300 },
  { day: '2023-06-03', uploads: 200 },
  { day: '2023-06-04', uploads: 278 },
  { day: '2023-06-05', uploads: 189 },
  { day: '2023-06-06', uploads: 239 },
  { day: '2023-06-07', uploads: 349 },
];

export function UploadActivityChart({ data = defaultData, loading = false }: UploadActivityChartProps) {
  // Function to format dates for X-axis
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    } catch (error) {
      return dateString;
    }
  };

  // Process data for the chart
  const chartData = data?.map(item => ({
    ...item,
    formattedDay: formatDate(item.day)
  })) || [];
  
  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center w-full h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin dark:text-blue-400" />
            <span className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading chart data...</span>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400">No upload data available</p>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
              <XAxis 
                dataKey="formattedDay" 
                stroke="rgba(100, 116, 139, 0.8)" 
              />
              <YAxis stroke="rgba(100, 116, 139, 0.8)" />
              <Tooltip
                formatter={(value) => [`${value} uploads`, 'Total']}
                contentStyle={{
                  background: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: "0.75rem",
                }}
                labelStyle={{ color: "#f8fafc" }}
              />
              <Bar dataKey="uploads" fill="url(#colorUv)" />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}