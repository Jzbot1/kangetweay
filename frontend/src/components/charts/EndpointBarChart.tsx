import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

interface EndpointData {
  path: string;
  count: number;
}

interface EndpointBarChartProps {
  data: EndpointData[];
  height?: number;
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

export const EndpointBarChart: React.FC<EndpointBarChartProps> = ({ data, height = 250 }) => {
  return (
    <div className="w-full" style={{ height }}>
      {data.length === 0 || data.every(d => d.count === 0) ? (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
          No endpoint calls registered.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
            <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="path"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111118',
                borderColor: '#1e1e2e',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default EndpointBarChart;
