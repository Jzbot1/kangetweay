import React, { useState } from 'react';
import { useUsage } from '../../hooks/useUsage.js';
import { UsageLineChart } from '../../components/charts/UsageLineChart.js';
import { EndpointBarChart } from '../../components/charts/EndpointBarChart.js';
import { SuccessDonutChart } from '../../components/charts/SuccessDonutChart.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { formatNumber } from '../../lib/utils.js';
import { Calendar, BarChart3, Key, Percent, Layers, ShieldCheck } from 'lucide-react';

export const Usage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const { stats, chart, endpoints, isLoadingStats, isLoadingChart, isLoadingEndpoints } = useUsage(period);

  // Simulated per-key usage progress trackers
  const keyLimits = [
    { name: "Web Client Production Key (mg_live_fa82b947)", count: 24500, limit: 50000, color: "bg-indigo-500" },
    { name: "Sandbox Testing Key (mg_live_6872fa13)", count: 420, limit: 500, color: "bg-amber-500" },
    { name: "Analytics Dashboard Query Key (mg_live_ca29fa81)", count: 1200, limit: 50000, color: "bg-sky-500" }
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 text-left select-none">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-200">Usage Analytics</h2>
            <p className="text-xs text-gray-500 mt-1">Track request latency, success margins, and endpoint traffic metrics.</p>
          </div>
          
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-gray-500 mr-1" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="h-10 px-3 bg-dark-surface border border-dark-border text-gray-300 text-sm rounded-input outline-none focus:border-brand/40"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Top Summaries */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-dark-surface border border-dark-border rounded-card flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Volume Dispatched</span>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20 rounded" />
            ) : (
              <span className="text-2xl font-extrabold text-gray-200 mt-1">{formatNumber(stats.totalRequests)}</span>
            )}
          </div>
          <div className="p-5 bg-dark-surface border border-dark-border rounded-card flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Average Success Rate</span>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20 rounded" />
            ) : (
              <span className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.successRate}%</span>
            )}
          </div>
          <div className="p-5 bg-dark-surface border border-dark-border rounded-card flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Calls Recorded Today</span>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20 rounded" />
            ) : (
              <span className="text-2xl font-extrabold text-sky-400 mt-1">{formatNumber(stats.callsToday)}</span>
            )}
          </div>
          <div className="p-5 bg-dark-surface border border-dark-border rounded-card flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Scoped Keys</span>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20 rounded" />
            ) : (
              <span className="text-2xl font-extrabold text-amber-400 mt-1">{stats.activeKeys}</span>
            )}
          </div>
        </div>

        {/* Charts block */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main traffic volume chart */}
          <div className="lg:col-span-2 p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4.5 h-4.5" />
              API Proxy Requests Volume Feed
            </h3>
            {isLoadingChart ? (
              <Skeleton className="h-[300px] w-full rounded-md" />
            ) : (
              <div className="mt-4">
                <UsageLineChart data={chart} height={300} />
              </div>
            )}
          </div>

          {/* Success Pie/Donut Chart */}
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-4.5 h-4.5" />
              Success vs Failure Ratio
            </h3>
            {isLoadingChart ? (
              <Skeleton className="h-[220px] w-full rounded-md" />
            ) : (
              <div className="mt-6">
                <SuccessDonutChart
                  successCount={chart.reduce((acc, curr) => acc + (curr.success || 0), 0)}
                  failedCount={chart.reduce((acc, curr) => acc + (curr.failed || 0), 0)}
                  height={220}
                />
              </div>
            )}
          </div>
        </div>

        {/* Down Charts & Rate Limit Bars */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Endpoints bar chart */}
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4.5 h-4.5" />
              Popular API Endpoint Paths Scopes
            </h3>
            {isLoadingEndpoints ? (
              <Skeleton className="h-[250px] w-full rounded-md" />
            ) : (
              <div className="mt-4">
                <EndpointBarChart data={endpoints} height={250} />
              </div>
            )}
          </div>

          {/* Per-key rate limits */}
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-4 select-text">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <Key className="w-4.5 h-4.5 text-gray-500" />
                API Key Quota limits progress
              </h3>
              <p className="text-xs text-gray-500 mt-1 select-none">Monitor daily quotas for active platform tokens</p>
            </div>

            <div className="flex flex-col gap-6 mt-4">
              {keyLimits.map((limitInfo) => {
                const percent = Math.round((limitInfo.count / limitInfo.limit) * 100);
                return (
                  <div key={limitInfo.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-300 truncate max-w-[280px]">{limitInfo.name}</span>
                      <span className="text-gray-400 select-none">
                        {formatNumber(limitInfo.count)} / {formatNumber(limitInfo.limit)} ({percent}%)
                      </span>
                    </div>
                    {/* Progress Track */}
                    <div className="h-2 w-full bg-dark-bg border border-dark-border rounded-full overflow-hidden select-none">
                      <div className={`h-full rounded-full ${limitInfo.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
export default Usage;
