import React, { useState } from 'react';
import { useApiKeys } from '../../hooks/useApiKeys.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { CopyButton } from '../../components/ui/CopyButton.js';
import { MaskedKey } from '../../components/ui/MaskedKey.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { formatDate } from '../../lib/utils.js';
import { Key, Plus, Trash2, ShieldAlert, Globe, Shield, Play, Send } from 'lucide-react';
import axios from 'axios';
import { JsonViewer } from '../../components/ui/JsonViewer.js';


export const ApiKeys: React.FC = () => {
  const { keys, isLoading, createKey, isCreating, revokeKey, isRevoking, deleteKey, isDeleting } = useApiKeys();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Create Form State
  const [keyName, setKeyName] = useState('');
  const [keyEnv, setKeyEnv] = useState<'uat' | 'production'>('production');
  const [keyIps, setKeyIps] = useState('');
  
  // Created key display (raw shown once)
  const [createdKeyData, setCreatedKeyData] = useState<{ rawKey: string; keyPrefix: string } | null>(null);

  // Playground State
  const [playgroundKey, setPlaygroundKey] = useState('');
  const [playgroundMethod, setPlaygroundMethod] = useState<'GET' | 'POST'>('GET');
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState('/categories');
  const [playgroundPayload, setPlaygroundPayload] = useState('{}');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
  const [playgroundTime, setPlaygroundTime] = useState<number | null>(null);

  // Gateway base URL — reads VITE_GATEWAY_BASE_URL (/v1 in production Dockerfile)
  const gatewayBaseUrl = (import.meta as any).env?.VITE_GATEWAY_BASE_URL || '/v1';

  const handleEndpointChange = (endpoint: string) => {
    setPlaygroundEndpoint(endpoint);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    setPlaygroundTime(null);
    if (endpoint === '/order/create') {
      setPlaygroundMethod('POST');
      setPlaygroundPayload(JSON.stringify({
        partner_order_id: `test_${Math.floor(Math.random() * 1000000)}`,
        product_id: "1000",
        category_id: "eVouchers",
        quantity: 1,
        fields: {
          target: "08123456789"
        }
      }, null, 2));
    } else {
      setPlaygroundMethod('GET');
      setPlaygroundPayload('{}');
    }
  };

  const handleSendTestRequest = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    setPlaygroundTime(null);

    const startTime = Date.now();
    try {
      let payloadObj = {};
      if (playgroundMethod === 'POST') {
        try {
          payloadObj = JSON.parse(playgroundPayload);
        } catch (e: any) {
          setPlaygroundResponse({ error: `Invalid JSON payload: ${e.message}` });
          setPlaygroundLoading(false);
          return;
        }
      }


      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': playgroundKey.trim()
        }
      };

      let res;
      if (playgroundMethod === 'POST') {
        res = await axios.post(`${gatewayBaseUrl}${playgroundEndpoint}`, payloadObj, config);
      } else {
        const urlSuffix = playgroundEndpoint === '/products' ? '?category_id=50' : '';
        res = await axios.get(`${gatewayBaseUrl}${playgroundEndpoint}${urlSuffix}`, config);
      }

      const latency = Date.now() - startTime;
      setPlaygroundStatus(res.status);
      setPlaygroundResponse(res.data);
      setPlaygroundTime(latency);
    } catch (err: any) {
      const latency = Date.now() - startTime;
      setPlaygroundTime(latency);
      if (err.response) {
        setPlaygroundStatus(err.response.status);
        setPlaygroundResponse(err.response.data);
      } else {
        setPlaygroundStatus(500);
        setPlaygroundResponse({ error: err.message || 'Request failed. Network error or CORS issue.' });
      }
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Deletion / Revocation confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    
    // Parse IP list
    const ipList = keyIps
      ? keyIps.split(',').map((ip) => ip.trim()).filter((ip) => ip.length > 0)
      : null;

    try {
      const res = await createKey({
        name: keyName,
        environment: keyEnv,
        ipAllowlist: ipList
      });
      setCreatedKeyData({ rawKey: res.rawKey, keyPrefix: res.key.key_prefix });
      setKeyName('');
      setKeyIps('');
      setCreateModalOpen(false);
    } catch (err) {
      // Handled by hook toasts
    }
  };

  const handleRevoke = async () => {
    if (!confirmRevokeId) return;
    try {
      await revokeKey(confirmRevokeId);
      setConfirmRevokeId(null);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteKey(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {}
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 text-left">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5 select-none">
          <div>
            <h2 className="text-xl font-bold text-gray-200">Gateway API Keys</h2>
            <p className="text-xs text-gray-500 mt-1">Authenticate calls to the /v1 endpoints. Keys are scoped per environment.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Generate New Key
          </Button>
        </div>

        {/* Content lists */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        ) : keys.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No API keys generated"
            description="You need at least one API key to perform operations via the proxy gateway."
            actionText="Generate API Key"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="bg-dark-surface border border-dark-border rounded-card shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-dark-border/60 text-gray-500 text-xs font-semibold uppercase tracking-wider select-none bg-dark-bg/25">
                    <th className="p-4">Key Label</th>
                    <th className="p-4">Prefix / Token</th>
                    <th className="p-4">Environment</th>
                    <th className="p-4">IP Allowlist</th>
                    <th className="p-4">Last Used</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/30">
                  {keys.map((key) => (
                    <tr key={key.id} className="hover:bg-dark-bg/10 transition-colors">
                      <td className="p-4 select-text">
                        <span className="font-semibold text-gray-300">{key.name}</span>
                      </td>
                      <td className="p-4">
                        <MaskedKey value={`${key.key_prefix}${'•'.repeat(24)}`} prefixLen={16} suffixLen={0} />
                      </td>
                      <td className="p-4 select-none">
                        <Badge variant={key.environment === 'production' ? 'info' : 'warning'}>
                          {key.environment}
                        </Badge>
                      </td>
                      <td className="p-4 select-text">
                        {key.ip_allowlist && key.ip_allowlist.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {key.ip_allowlist.map((ip) => (
                              <span key={ip} className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-xs text-gray-400 font-mono">
                                {ip}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-1.5 text-xs">
                            <Globe className="w-3.5 h-3.5" />
                            All IPs allowed
                          </span>
                        )}
                      </td>
                      <td className="p-4 select-text">
                        <span className="text-xs text-gray-500">{formatDate(key.last_used_at)}</span>
                      </td>
                      <td className="p-4 text-right select-none">
                        <div className="flex items-center justify-end gap-2">
                          {key.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 h-8 px-2.5"
                              onClick={() => setConfirmRevokeId(key.id)}
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Badge variant="danger">Revoked</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/5 h-8 w-8 p-0"
                            onClick={() => setConfirmDeleteId(key.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* API Gateway Playground Section */}
        <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-1 select-none">
            <h3 className="text-md font-bold text-gray-200 flex items-center gap-2">
              <Play className="w-4 h-4 text-brand fill-current" />
              API Gateway Playground
            </h3>
            <p className="text-xs text-gray-500">Test the live platform proxy API calls using your generated raw API keys directly from the browser.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Request Builder */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider select-none">1. Authenticate Request (X-API-Key)</label>
                <input
                  type="password"
                  placeholder="Paste your mg_live_... API key here"
                  value={playgroundKey}
                  onChange={(e) => setPlaygroundKey(e.target.value)}
                  className="w-full h-10 px-3 bg-dark-bg border border-dark-border text-indigo-300 font-mono text-sm rounded-input outline-none transition-colors placeholder-gray-600 focus:border-brand/40"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider select-none">Method</label>
                  <select
                    disabled
                    value={playgroundMethod}
                    className="w-full h-10 px-3 bg-dark-bg border border-dark-border text-gray-300 text-sm rounded-input outline-none font-bold select-none opacity-80"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider select-none">Endpoint Route</label>
                  <select
                    value={playgroundEndpoint}
                    onChange={(e) => handleEndpointChange(e.target.value)}
                    className="w-full h-10 px-3 bg-dark-bg border border-dark-border text-gray-300 text-sm rounded-input outline-none focus:border-brand/40"
                  >
                    <option value="/categories">/categories (Get Categories)</option>
                    <option value="/products">/products (Get Category Products)</option>
                    <option value="/order/create">/order/create (Place order)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider select-none">Target Gateway URL</label>
                <div className="h-10 px-3 bg-[#0a0a0f] border border-dark-border/60 text-gray-500 font-mono text-xs rounded-input flex items-center select-all select-none">
                  {gatewayBaseUrl}{playgroundEndpoint}
                  {playgroundEndpoint === '/products' && '?category_id=50'}
                </div>
              </div>

              {playgroundMethod === 'POST' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider select-none">POST Request Body (JSON)</label>
                  <textarea
                    rows={6}
                    value={playgroundPayload}
                    onChange={(e) => setPlaygroundPayload(e.target.value)}
                    className="w-full p-3 bg-dark-bg border border-dark-border text-indigo-300 font-mono text-xs rounded-input outline-none transition-colors focus:border-brand/40"
                  />
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleSendTestRequest}
                loading={playgroundLoading}
                disabled={!playgroundKey.trim()}
                className="mt-2 font-semibold text-sm h-11 flex items-center gap-2 select-none"
              >
                <Send className="w-4 h-4" />
                Send Request Test
              </Button>
            </div>

            {/* Response Console */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-dark-border/30 pb-3 select-none">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Response Details</span>
                {playgroundStatus !== null && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">Status:</span>
                      <Badge variant={playgroundStatus >= 200 && playgroundStatus < 300 ? 'success' : 'danger'}>
                        {playgroundStatus}
                      </Badge>
                    </div>
                    {playgroundTime !== null && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">Latency:</span>
                        <span className="text-xs font-mono font-bold text-gray-300">{playgroundTime}ms</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {playgroundResponse ? (
                <div className="flex-1 flex flex-col justify-start">
                  <JsonViewer data={playgroundResponse} title="Response Payload JSON" defaultExpanded={true} />
                </div>
              ) : (
                <div className="flex-1 min-h-[200px] border border-dashed border-dark-border rounded-card bg-dark-bg/10 flex flex-col items-center justify-center text-center p-6 select-none">
                  {playgroundLoading ? (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-500 font-medium animate-pulse">Request in transit...</span>
                    </div>
                  ) : (
                    <>
                      <Key className="w-10 h-10 text-gray-600 mb-3" />
                      <h3 className="text-sm font-semibold text-gray-400">Response Console Offline</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                        Input your API Key, select the target endpoint, and click "Send Request Test" to view response payloads.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Generate Modal */}
        <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Generate Gateway API Key">
          <form onSubmit={handleCreateKey} className="flex flex-col gap-5 text-left">
            <Input
              label="Key Name / Label"
              placeholder="e.g. Production Web Client"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Environment</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setKeyEnv('production')}
                  className={`h-11 rounded-btn border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    keyEnv === 'production'
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-dark-border text-gray-400 hover:bg-dark-surface'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Production
                </button>
                <button
                  type="button"
                  onClick={() => setKeyEnv('uat')}
                  className={`h-11 rounded-btn border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    keyEnv === 'uat'
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-dark-border text-gray-400 hover:bg-dark-surface'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Sandbox (UAT)
                </button>
              </div>
            </div>

            <Input
              label="IP Address Allowlist (Optional)"
              placeholder="e.g. 192.168.1.1, 10.0.0.4"
              helperText="Comma separated values. Leave blank to allow any requesting IP address."
              value={keyIps}
              onChange={(e) => setKeyIps(e.target.value)}
            />

            <Button type="submit" variant="primary" className="h-10 mt-3 font-semibold text-sm w-full" loading={isCreating}>
              Create API Key
            </Button>
          </form>
        </Modal>

        {/* Raw Key Display Modal (Shown ONCE) */}
        <Modal
          isOpen={!!createdKeyData}
          onClose={() => setCreatedKeyData(null)}
          title="API Key Created Successfully"
          className="max-w-md"
        >
          <div className="flex flex-col gap-5 text-left">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-card flex gap-2.5 items-start text-xs leading-relaxed">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Write down this API key now!</span> For security purposes, we cannot show it to you again. If you lose it, you will have to generate a new key.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Raw API Token</span>
              <div className="h-12 border border-dark-border rounded-input bg-dark-bg/60 px-4 flex items-center justify-between font-mono text-sm shadow-inner select-text">
                <input
                  type="text"
                  readOnly
                  value={createdKeyData?.rawKey || ''}
                  onClick={(e) => e.currentTarget.select()}
                  className="bg-transparent border-none outline-none text-indigo-300 font-semibold w-full mr-2 select-all cursor-text font-mono text-sm"
                />
                <CopyButton value={createdKeyData?.rawKey || ''} toastMessage="API Key copied to clipboard" className="h-8 w-8 flex-shrink-0" />
              </div>
            </div>

            <Button
              variant="secondary"
              className="font-semibold text-sm w-full mt-2 h-10"
              onClick={() => setCreatedKeyData(null)}
            >
              I have copied it securely
            </Button>
          </div>
        </Modal>

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={!!confirmRevokeId}
          onClose={() => setConfirmRevokeId(null)}
          onConfirm={handleRevoke}
          title="Revoke API Key"
          message="Are you sure you want to revoke this API key? Systems authenticating with it will lose immediate access. You cannot unrevoke a key."
          confirmText="Revoke Access"
          loading={isRevoking}
        />

        <ConfirmDialog
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete API Key"
          message="Are you sure you want to permanently delete this API key? This action is destructive and cannot be undone."
          confirmText="Delete Key"
          loading={isDeleting}
        />
      </div>
    </PageWrapper>
  );
};
export default ApiKeys;
