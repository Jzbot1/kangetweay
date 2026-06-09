import React, { useState } from 'react';
import { useUsage } from '../../hooks/useUsage.js';
import { useUsageQuota } from '../../hooks/useUsageQuota.js';
import { UsageLineChart } from '../../components/charts/UsageLineChart.js';
import { EndpointBarChart } from '../../components/charts/EndpointBarChart.js';
import { SuccessDonutChart } from '../../components/charts/SuccessDonutChart.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { formatNumber } from '../../lib/utils.js';
import {
  Calendar, BarChart3, Key, Percent, Layers,
  ShieldCheck, Infinity, AlertTriangle, TrendingUp
} from 'lucide-react';

export const Usage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const { stats, chart, endpoints, isLoadingStats, isLoadingChart, isLoadingEndpoints } = useUsage(period);
  const { quota, percent, barColor, textColor, isLoading: isLoadingQuota } = useUsageQuota();

  // Determine quota status label
  const isNearLimit = percent !== null && percent >= 70;
  const isOverLimit = percent !== null && percent >= 90;

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

        {/* ── Monthly Quota Banner ── */}
        <div className={`p-5 rounded-card border shadow-xl flex flex-col gap-4 ${
          isOverLimit
            ? 'bg-red-500/8 border-red-500/25'
            : isNearLimit
            ? 'bg-amber-500/8 border-amber-500/25'
            : 'bg-dark-surface border-dark-border'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              {isOverLimit ? (
                <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
              ) : (
                <TrendingUp className="w-4.5 h-4.5 text-gray-400" />
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-200">
                  Monthly Request Quota
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isLoadingQuota
                    ? 'Loading...'
                    : quota?.limit != null
                    ? `Resets on ${new Date(quota.resetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                    : 'No limit set by admin — unlimited usage'}
                </p>
              </div>
            </div>

            {/* Usage count badge */}
            {isLoadingQuota ? (
              <Skeleton className="h-8 w-40 rounded-md" />
            ) : quota?.limit != null ? (
              <div className="flex items-center gap-2">
                <span className={`text-xl font-extrabold tabular-nums ${textColor}`}>
                  {formatNumber(quota.used)}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  / {formatNumber(quota.limit)}
                </span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
                  isOverLimit
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : isNearLimit
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                }`}>
                  {percent}%
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Infinity className="w-5 h-5" />
                <span className="text-sm font-semibold">Unlimited</span>
              </div>
            )}
          </div>

          {/* Progress bar (only shown when there is a limit) */}
          {!isLoadingQuota && quota?.limit != null && (
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-full bg-dark-bg border border-dark-border/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {isOverLimit && (
                <p className="text-xs text-red-400 font-semibold">
                  ⚠ You are approaching your monthly limit. Contact your admin to increase your quota.
                </p>
              )}
            </div>
          )}
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

        {/* Down Charts & Quota Details */}
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

          {/* Quota Breakdown Card */}
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-5 select-text">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <Key className="w-4.5 h-4.5 text-gray-500" />
                Monthly Quota Breakdown
              </h3>
              <p className="text-xs text-gray-500 mt-1 select-none">
                Admin-assigned limits for your account this billing cycle
              </p>
            </div>

            {isLoadingQuota ? (
              <div className="flex flex-col gap-4 mt-2">
                <Skeleton className="h-14 w-full rounded-md" />
                <Skeleton className="h-14 w-full rounded-md" />
              </div>
            ) : (
              <div className="flex flex-col gap-5 mt-2">
                {/* Total requests row */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-300">Total Requests (This Month)</span>
                    <span className="text-gray-400 select-none">
                      {formatNumber(quota?.used ?? 0)}
                      {quota?.limit != null ? ` / ${formatNumber(quota.limit)}` : ' / ∞'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-dark-bg border border-dark-border rounded-full overflow-hidden select-none">
                    {quota?.limit != null ? (
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-indigo-500/30 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Status details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-dark-bg border border-dark-border flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Requests Used</span>
                    <span className={`text-lg font-extrabold tabular-nums ${textColor}`}>
                      {formatNumber(quota?.used ?? 0)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-bg border border-dark-border flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Quota Limit</span>
                    {quota?.limit != null ? (
                      <span className="text-lg font-extrabold text-gray-200 tabular-nums">
                        {formatNumber(quota.limit)}
                      </span>
                    ) : (
                      <span className="text-lg font-extrabold text-indigo-400 flex items-center gap-1">
                        <Infinity className="w-5 h-5" /> Unlimited
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-dark-bg border border-dark-border flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Remaining</span>
                    <span className="text-lg font-extrabold text-gray-200 tabular-nums">
                      {quota?.limit != null
                        ? formatNumber(Math.max(0, quota.limit - quota.used))
                        : '∞'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-bg border border-dark-border flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Resets On</span>
                    <span className="text-sm font-bold text-gray-300">
                      {quota?.resetDate
                        ? new Date(quota.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Admin note */}
                <p className="text-[11px] text-gray-600 border-t border-dark-border/50 pt-3 select-none">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-gray-600" />
                  Limits are configured by your administrator. Contact admin to adjust your quota.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};
export default Usage;
