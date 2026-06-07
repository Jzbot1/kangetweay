import React, { useState, useEffect } from 'react';
import { useOrders, useOrderDetail } from '../../hooks/useOrders.js';
import { useOrderStore } from '../../stores/orderStore.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { SlideOver } from '../../components/ui/SlideOver.js';
import { JsonViewer } from '../../components/ui/JsonViewer.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { formatDate, formatNumber } from '../../lib/utils.js';
import {
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  X,
  History,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Orders: React.FC = () => {
  const { filters, setFilters, resetFilters, selectedOrderId, setSelectedOrderId } = useOrderStore();
  
  // Local state for debounced search and inputs
  const [searchInput, setSearchInput] = useState(filters.search);
  const [statusInput, setStatusInput] = useState(filters.status);
  const [fromInput, setFromInput] = useState(filters.from);
  const [toInput, setToInput] = useState(filters.to);

  // Sync search input with store after a short debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({ search: searchInput, page: 1 });
    }, 450);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { orders, total, page, limit, isLoading, refetch } = useOrders(filters);

  // Load selected order detailed timelines
  const { order: selectedOrder, events: selectedEvents, isLoading: isLoadingDetail } = useOrderDetail(selectedOrderId);

  const handleClearFilters = () => {
    setSearchInput('');
    setStatusInput('');
    setFromInput('');
    setToInput('');
    resetFilters();
  };

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

  const totalPages = Math.ceil(total / limit);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 text-left">
        {/* Filters Toolbar */}
        <div className="p-4 bg-dark-surface border border-dark-border rounded-card shadow-lg flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by Partner Order ID, Product ID, quantity..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-dark-bg border border-dark-border text-gray-200 text-sm rounded-input outline-none transition-colors placeholder-gray-600 focus:border-brand/40"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Select */}
              <select
                value={statusInput}
                onChange={(e) => {
                  setStatusInput(e.target.value);
                  setFilters({ status: e.target.value, page: 1 });
                }}
                className="h-10 px-3 bg-dark-bg border border-dark-border text-gray-300 text-sm rounded-input outline-none focus:border-brand/40"
              >
                <option value="">All Statuses Scopes</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="incorrect-details">Incorrect Details</option>
                <option value="failed">Failed</option>
              </select>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromInput}
                  onChange={(e) => {
                    setFromInput(e.target.value);
                    setFilters({ from: e.target.value, page: 1 });
                  }}
                  className="h-10 px-3 bg-dark-bg border border-dark-border text-gray-400 text-sm rounded-input outline-none focus:border-brand/40 font-medium"
                />
                <span className="text-gray-600 text-xs">to</span>
                <input
                  type="date"
                  value={toInput}
                  onChange={(e) => {
                    setToInput(e.target.value);
                    setFilters({ to: e.target.value, page: 1 });
                  }}
                  className="h-10 px-3 bg-dark-bg border border-dark-border text-gray-400 text-sm rounded-input outline-none focus:border-brand/40 font-medium"
                />
              </div>

              {/* Clear button */}
              {(filters.status || filters.search || filters.from || filters.to) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-2"
                >
                  <X className="w-4.5 h-4.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table / Mobile Card stack */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found matching filters"
            description="Adjust your search criteria, statuses, or target date ranges and try again."
            actionText="Reset All Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-dark-surface border border-dark-border rounded-card shadow-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-dark-border/60 text-gray-500 text-xs font-semibold uppercase tracking-wider select-none bg-dark-bg/25">
                    <th className="p-4">Partner Order ID</th>
                    <th className="p-4">MooGold Order ID</th>
                    <th className="p-4">Product ID</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/30 select-text">
                  {orders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className="hover:bg-dark-bg/15 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-mono font-semibold text-gray-300 max-w-[150px] truncate">
                        {ord.partner_order_id || ord.id.substring(0, 8)}
                      </td>
                      <td className="p-4 font-mono text-gray-400">
                        {ord.moogold_order_id || '-'}
                      </td>
                      <td className="p-4 text-gray-300 font-medium">{ord.product_id}</td>
                      <td className="p-4 text-gray-400 font-semibold">{ord.quantity}</td>
                      <td className="p-4 text-right text-gray-300 font-semibold">
                        {ord.amount ? `$${formatNumber(ord.amount)}` : '-'}
                      </td>
                      <td className="p-4 text-xs text-gray-500">{formatDate(ord.created_at)}</td>
                      <td className="p-4 text-right">
                        <Badge variant={getStatusVariant(ord.status)}>{ord.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack View */}
            <div className="md:hidden flex flex-col gap-4 select-text">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className="p-4 bg-dark-surface border border-dark-border rounded-card flex flex-col gap-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-gray-300 truncate max-w-[200px]">
                      {ord.partner_order_id || ord.id.substring(0, 8)}
                    </span>
                    <Badge variant={getStatusVariant(ord.status)}>{ord.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs select-none">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-500">Product ID</span>
                      <span className="text-gray-300 font-medium select-text">{ord.product_id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-gray-500">Amount</span>
                      <span className="text-gray-300 font-bold select-text">
                        {ord.amount ? `$${formatNumber(ord.amount)}` : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 pt-2 border-t border-dark-border/40 select-none">
                    {formatDate(ord.created_at)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between select-none pt-2">
                <span className="text-xs text-gray-500">
                  Showing page {page} of {totalPages} ({total} entries)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="p-2 h-8 w-8"
                    disabled={page === 1}
                    onClick={() => setFilters({ page: page - 1 })}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="p-2 h-8 w-8"
                    disabled={page === totalPages}
                    onClick={() => setFilters({ page: page + 1 })}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Timeline slide drawer */}
        <SlideOver
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          title="Order Tracking Details Scopes"
        >
          {isLoadingDetail || !selectedOrder ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-[250px] w-full rounded-md" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 text-left select-text">
              {/* Top Overview Cards */}
              <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Order Status Scope</span>
                  <Badge variant={getStatusVariant(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <div className="flex flex-col gap-1.5 border-t border-dark-border/40 pt-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest select-none">Order UUID</span>
                  <span className="font-mono text-xs text-gray-300 font-semibold break-all">{selectedOrder.id}</span>
                </div>
              </div>

              {/* Event timelines */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <History className="w-4 h-4" />
                  Transaction Event History
                </h3>
                <div className="flex flex-col gap-4 border-l-2 border-dark-border pl-4 ml-2 mt-2">
                  {selectedEvents.map((evt) => (
                    <div key={evt.id} className="relative flex flex-col gap-0.5">
                      {/* Node point */}
                      <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand border border-[#0a0a0f]" />
                      <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                        {evt.status}
                        <span className="text-[10px] text-gray-500 font-normal">
                          {formatDate(evt.created_at)}
                        </span>
                      </span>
                      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{evt.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Payloads detail */}
              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <Info className="w-4 h-4" />
                  Payload Parameters Inspection
                </h3>
                
                <JsonViewer data={selectedOrder.request_payload} title="Proxy Request parameters" defaultExpanded={false} />
                
                {selectedOrder.response_payload && (
                  <JsonViewer data={selectedOrder.response_payload} title="MooGold API Response data" defaultExpanded={true} />
                )}
              </div>
            </div>
          )}
        </SlideOver>
      </div>
    </PageWrapper>
  );
};
export default Orders;
