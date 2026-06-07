import React, { useState } from 'react';
import { useWebhooks, useWebhookLogs } from '../../hooks/useWebhooks.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { MaskedKey } from '../../components/ui/MaskedKey.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { formatDate, formatNumber } from '../../lib/utils.js';
import { Webhook, Plus, Settings, Play, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Webhooks: React.FC = () => {
  const { webhook, isLoading, createWebhook, isCreating, updateWebhook, isUpdating, deleteWebhook, isDeleting } = useWebhooks();
  
  const [urlInput, setUrlInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);

  // Deletion confirm
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Load logs if webhook exists
  const { logs, total, resendWebhook, isResending } = useWebhookLogs(webhook?.id || null, page, 10);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    try {
      await createWebhook({ url: urlInput });
      setIsEditing(false);
    } catch (err) {}
  };

  const handleUpdateToggle = async (active: boolean) => {
    if (!webhook) return;
    try {
      await updateWebhook({ id: webhook.id, url: webhook.url, isActive: active });
    } catch (err) {}
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhook || !urlInput.trim()) return;
    try {
      await updateWebhook({ id: webhook.id, url: urlInput, isActive: webhook.is_active });
      setIsEditing(false);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!webhook) return;
    try {
      await deleteWebhook(webhook.id);
      setConfirmDeleteOpen(false);
      setUrlInput('');
    } catch (err) {}
  };

  const triggerResend = async (logId: string) => {
    try {
      await resendWebhook(logId);
    } catch (err) {}
  };

  const startEditing = () => {
    if (webhook) {
      setUrlInput(webhook.url);
    }
    setIsEditing(true);
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 text-left">
        {/* Settings config cards */}
        {isLoading ? (
          <Skeleton className="h-44 rounded-card w-full" />
        ) : !webhook ? (
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-5 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-gray-200">Configure Webhook Receiver</h3>
              <p className="text-xs text-gray-500 mt-1">Receive automated updates in your servers when order statuses change (completed, refunded, etc).</p>
            </div>
            
            <form onSubmit={handleCreate} className="flex gap-3">
              <Input
                type="url"
                placeholder="https://your-domain.com/webhooks"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                className="flex-1 h-11"
              />
              <Button type="submit" variant="primary" className="h-11 font-semibold text-sm px-6" loading={isCreating}>
                Configure
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-6 max-w-4xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dark-border/40 pb-5 gap-3 select-none">
              <div>
                <h3 className="text-base font-bold text-gray-200">Webhook Integration Endpoint</h3>
                <p className="text-xs text-gray-500 mt-1">Status changes are POSTed directly to this URL.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={webhook.is_active ? 'ghost' : 'success'}
                  size="sm"
                  onClick={() => handleUpdateToggle(!webhook.is_active)}
                  loading={isUpdating}
                  className={webhook.is_active ? "text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 h-9" : "h-9"}
                >
                  {webhook.is_active ? 'Disable Endpoint' : 'Enable Endpoint'}
                </Button>
                <Button variant="danger" size="sm" onClick={() => setConfirmDeleteOpen(true)} className="h-9">
                  Delete
                </Button>
              </div>
            </div>

            {/* Display / edit form */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex gap-3 max-w-2xl">
                <Input
                  type="url"
                  placeholder="https://your-domain.com/webhooks"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                  className="flex-1 h-10"
                />
                <Button type="submit" variant="primary" className="h-10 text-xs font-semibold px-4" loading={isUpdating}>
                  Save
                </Button>
                <Button type="button" variant="ghost" className="h-10 text-xs" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-5 text-left">
                <div className="grid sm:grid-cols-2 gap-6 text-sm">
                  <div className="flex flex-col gap-1 select-none">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Receiver Target URL</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-semibold text-gray-300 select-text">{webhook.url}</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={startEditing}>
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider select-none">Signing Secret Key</span>
                    <div className="mt-1">
                      <MaskedKey value={webhook.signing_secret} prefixLen={6} suffixLen={6} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 rounded-card flex gap-2.5 items-start text-xs leading-relaxed max-w-2xl select-none">
                  <Settings className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-400" />
                  <div>
                    JZGateway uses this secret key to compute HMAC-SHA256 signatures for payload requests. You can inspect the signature validation header under <code className="bg-dark-bg/60 px-1 py-0.5 rounded font-mono text-[10px] text-indigo-300">X-GoldBridge-Signature</code>.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Webhook logs table */}
        {webhook && (
          <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider select-none">Webhook Delivery Log history</h3>
              <p className="text-xs text-gray-500 mt-1 select-none">Monitor HTTP responses, latency times, and retry histories</p>
            </div>

            {logs.length === 0 ? (
              <div className="py-6 select-none">
                <EmptyState
                  icon={CheckCircle}
                  title="No webhook events logged yet"
                  description="Once order statuses update, webhook delivery logs will be tracked here."
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-dark-border/60 text-gray-500 text-xs font-semibold uppercase tracking-wider select-none bg-dark-bg/25">
                        <th className="p-4">Event Type</th>
                        <th className="p-4">HTTP Status</th>
                        <th className="p-4">Response Time</th>
                        <th className="p-4">Attempts</th>
                        <th className="p-4">Last Dispatched</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 font-medium">
                      {logs.map((log) => {
                        const success = log.http_status && log.http_status >= 200 && log.http_status < 300;
                        return (
                          <tr key={log.id} className="hover:bg-dark-bg/10 transition-colors">
                            <td className="p-4 select-text">
                              <span className="font-mono text-xs text-gray-300">{log.event_type}</span>
                            </td>
                            <td className="p-4 select-text">
                              <Badge variant={success ? 'success' : 'danger'}>
                                {log.http_status || 'Failed'}
                              </Badge>
                            </td>
                            <td className="p-4 select-text">
                              <span className="text-gray-400">{log.response_time_ms ? `${log.response_time_ms}ms` : '-'}</span>
                            </td>
                            <td className="p-4 select-text">
                              <span className="text-gray-400">{log.attempt_count} / 10</span>
                            </td>
                            <td className="p-4 select-text">
                              <span className="text-xs text-gray-500">{formatDate(log.delivered_at || log.created_at)}</span>
                            </td>
                            <td className="p-4 text-right select-none">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs font-semibold flex items-center gap-1.5 hover:bg-brand/5 hover:text-brand"
                                onClick={() => triggerResend(log.id)}
                                loading={isResending}
                              >
                                <Play className="w-3 h-3 fill-current" />
                                Resend
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between select-none pt-2">
                    <span className="text-xs text-gray-500">
                      Showing page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" className="p-2 h-8 w-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" className="p-2 h-8 w-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Delete Webhook Confirm */}
        <ConfirmDialog
          isOpen={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleDelete}
          title="Delete Webhook Endpoint"
          message="Are you sure you want to delete this webhook configuration? You will stop receiving asynchronous callback notifications."
          confirmText="Delete Endpoint"
          loading={isDeleting}
        />
      </div>
    </PageWrapper>
  );
};
export default Webhooks;
