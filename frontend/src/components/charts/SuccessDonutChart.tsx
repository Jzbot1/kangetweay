import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts';

interface DonutProps {
  successCount: number;
  failedCount: number;
  height?: number;
}

export const SuccessDonutChart: React.FC<DonutProps> = ({ successCount, failedCount, height = 220 }) => {
  const data = [
    { name: 'Successful', value: successCount },
    { name: 'Failed', value: failedCount }
  ];

  const total = successCount + failedCount;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 100;

  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ height }}>
      {total === 0 ? (
        <div className="text-gray-500 text-sm">No transaction events logged.</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111118',
                  borderColor: '#1e1e2e',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Central label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
            <span className="text-2xl font-bold text-gray-200">{successRate}%</span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Success</span>
          </div>
        </>
      )}
    </div>
  );
};
export default SuccessDonutChart;
