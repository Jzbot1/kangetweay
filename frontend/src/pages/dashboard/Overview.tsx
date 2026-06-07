import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Activity,
  Key,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { useUsage } from '../../hooks/useUsage.js';
import { useOrders } from '../../hooks/useOrders.js';
import { useCredentialsBalances } from '../../hooks/useCredentials.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { formatDate, formatNumber } from '../../lib/utils.js';
import ROUTES from '../../constants/routes.js';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { stats, chart, isLoadingStats } = useUsage('7d');
  const { data: balances, isLoading: isLoadingBalances } = useCredentialsBalances();
  
  // Fetch recent 5 orders
  const { orders, isLoading: isLoadingOrders } = useOrders({ page: 1, limit: 5 });

  const statsCards = [
    {
      name: "Total Requests (7d)",
      value: stats.totalRequests,
      icon: Layers,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/15",
      isCustomEl: false
    },
    {
      name: "API Success Rate",
      value: `${stats.successRate}%`,
      icon: Activity,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15",
      isCustomEl: false
    },
    {
      name: "API Calls Today",
      value: stats.callsToday,
      icon: TrendingUp,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/15",
      isCustomEl: false
    },
    {
      name: "Active API Keys",
      value: stats.activeKeys,
      icon: Key,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/15",
      isCustomEl: false
    },
    {
      name: "MooGold Balance",
      value: balances ? (
        <div className="flex flex-col text-left gap-1 mt-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] text-gray-500 font-bold uppercase">UAT:</span>
            <span className="font-extrabold text-xs text-indigo-300">
              {balances.uat.configured ? `₹${formatNumber(balances.uat.balance)}` : 'Not Set'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] text-gray-500 font-bold uppercase">PROD:</span>
            <span className="font-extrabold text-xs text-emerald-400">
              {balances.production.configured ? `₹${formatNumber(balances.production.balance)}` : 'Not Set'}
            </span>
          </div>
        </div>
      ) : 'Loading...',
      icon: Wallet,
      color: "text-brand bg-brand/10 border-brand/15",
      isCustomEl: true
    }
  ];

  // Helper for order status badges
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'processing';
      case 'refunded': return 'warning';
      case 'incorrect-details': return 'warning';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 text-left">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className="p-5 md:p-6 bg-dark-surface border border-dark-border rounded-card flex flex-col gap-4 shadow-xl select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.name}</span>
                  <div className={`p-2 rounded-lg border ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                {isLoadingStats || (card.isCustomEl && isLoadingBalances) ? (
                  <Skeleton className="h-9 w-20 rounded-md" />
                ) : card.isCustomEl ? (
                  card.value
                ) : (
                  <span className="text-2xl md:text-3xl font-extrabold text-gray-200 tracking-tight">
                    {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Chart and Sparkline */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Sparkline card */}
          <div className="lg:col-span-2 p-6 bg-dark-surface border border-dark-border rounded-card flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between select-none">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">API Traffic Sparkline</h3>
                <p className="text-xs text-gray-500 mt-1">Total proxy volume over the last 7 days</p>
              </div>
              <Link to={ROUTES.DASHBOARD.USAGE} className="flex items-center gap-1.5 text-xs text-brand hover:underline font-semibold">
                Analytics <ChevronRight className="w-4.5 h-4.5" />
              </Link>
            </div>
            
            {isLoadingStats ? (
              <Skeleton className="h-[120px] w-full rounded-md" />
            ) : (
              <div className="h-[120px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sparklineGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111118',
                        borderColor: '#1e1e2e',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#sparklineGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick links info */}
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card flex flex-col justify-between shadow-xl select-none">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">UAT Playground</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Before releasing, configure a Sandbox/UAT client connection in the Credentials panel and toggle your UAT API keys to run test top-ups safely.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 mt-6 border-t border-dark-border/40 pt-5">
              <Link
                to={ROUTES.DASHBOARD.CREDENTIALS}
                className="flex items-center justify-between text-xs font-semibold text-gray-300 hover:text-brand transition-colors group"
              >
                <span>Manage Credentials Vault</span>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
              </Link>
              <Link
                to={ROUTES.DASHBOARD.WEBHOOKS}
                className="flex items-center justify-between text-xs font-semibold text-gray-300 hover:text-brand transition-colors group"
              >
                <span>Setup Webhooks Endpoint</span>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders table */}
        <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between select-none">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent top-up activities</h3>
              <p className="text-xs text-gray-500 mt-1">Real-time gateway feed of latest processed orders</p>
            </div>
            <Link to={ROUTES.DASHBOARD.ORDERS} className="text-xs text-brand font-semibold hover:underline flex items-center gap-1">
              View All Orders <ChevronRight className="w-4.5 h-4.5" />
            </Link>
          </div>

          {isLoadingOrders ? (
            <div className="flex flex-col gap-2 mt-2">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-6 mt-2">
              <EmptyState
                icon={ShoppingBag}
                title="No orders recorded yet"
                description="Once you configure your credentials and send requests via X-API-Key, they will show up in this feed."
                actionText="View API Integration Docs"
                onAction={() => navigate(ROUTES.DOCS)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-dark-border/60 text-gray-500 text-xs font-semibold uppercase tracking-wider select-none">
                    <th className="pb-3 font-semibold">Order ID / Date</th>
                    <th className="pb-3 font-semibold">Product ID</th>
                    <th className="pb-3 font-semibold">Quantity</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 select-text">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-dark-bg/20 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-gray-300 truncate max-w-[140px] font-mono">
                            {ord.partner_order_id || ord.id.substring(0, 8)}
                          </span>
                          <span className="text-[10px] text-gray-500">{formatDate(ord.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-gray-300 font-medium">{ord.product_id}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-gray-400 font-semibold">{ord.quantity}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="text-gray-300 font-semibold">
                          {ord.amount ? `₹${formatNumber(ord.amount)}` : '-'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Badge variant={getStatusVariant(ord.status)}>
                          {ord.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
export default Overview;
