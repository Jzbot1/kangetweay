import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface LineChartData {
  date: string;
  requests: number;
  success: number;
  failed: number;
}

interface UsageLineChartProps {
  data: LineChartData[];
  height?: number;
}

export const UsageLineChart: React.FC<UsageLineChartProps> = ({ data, height = 300 }) => {
  return (
    <div className="w-full" style={{ height }}>
      {data.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
          No usage history found.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111118',
                borderColor: '#1e1e2e',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Area
              name="Total Calls"
              type="monotone"
              dataKey="requests"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRequests)"
            />
            <Area
              name="Successful"
              type="monotone"
              dataKey="success"
              stroke="#10b981"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorSuccess)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default UsageLineChart;
