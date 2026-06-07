import React, { useState } from 'react';
import { useCredentials } from '../../hooks/useCredentials.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { ShieldCheck, Plus, Sparkles, Check, Trash2, Edit2, Play } from 'lucide-react';

export const Credentials: React.FC = () => {
  const {
    credentials,
    isLoading,
    createCredential,
    isCreating,
    updateCredential,
    isUpdating,
    deleteCredential,
    isDeleting,
    setDefault,
    isSettingDefault,
    testConnection,
    isTesting,
    testConnectionDirect,
    isTestingDirect
  } = useCredentials();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCredId, setEditingCredId] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [environment, setEnvironment] = useState<'uat' | 'production'>('production');

  // Actions confirmations
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [testingCredId, setTestingCredId] = useState<string | null>(null);

  // Connection Test States
  const [modalTestStatus, setModalTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [cardStatuses, setCardStatuses] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleOpenAdd = () => {
    setEditingCredId(null);
    setLabel('');
    setPartnerId('');
    setSecretKey('');
    setEnvironment('production');
    setModalTestStatus(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cred: any) => {
    setEditingCredId(cred.id);
    setLabel(cred.label);
    setPartnerId(cred.partner_id);
    setSecretKey(''); // Leave blank unless changing
    setEnvironment(cred.environment);
    setModalTestStatus(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !partnerId.trim()) return;

    try {
      if (editingCredId) {
        await updateCredential({
          id: editingCredId,
          label,
          partnerId,
          secretKey: secretKey.trim() || undefined,
          environment
        });
      } else {
        if (!secretKey.trim()) return;
        await createCredential({
          label,
          partnerId,
          secretKey,
          environment
        });
      }
      setModalOpen(false);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteCredential(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {}
  };

  const handleTestConnection = async (id: string) => {
    setTestingCredId(id);
    try {
      const result = await testConnection(id);
      setCardStatuses(prev => ({
        ...prev,
        [id]: { success: result.success, message: result.message }
      }));
    } catch (err: any) {
      setCardStatuses(prev => ({
        ...prev,
        [id]: { success: false, message: err.message || 'Connection test failed' }
      }));
    } finally {
      setTestingCredId(null);
    }
  };

  const handleTestUnsaved = async () => {
    if (!partnerId.trim()) return;
    if (!editingCredId && !secretKey.trim()) return;

    try {
      const result = await testConnectionDirect({
        id: editingCredId || undefined,
        partnerId,
        secretKey: secretKey.trim() || undefined,
        environment
      });
      setModalTestStatus({ success: result.success, message: result.message });
    } catch (err: any) {
      setModalTestStatus({ success: false, message: err.message || 'Connection test failed' });
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 text-left">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5 select-none">
          <div>
            <h2 className="text-xl font-bold text-gray-200">MooGold Credentials</h2>
            <p className="text-xs text-gray-500 mt-1">Configure your accounts credentials. jzgateway uses these to send orders to MooGold APIs.</p>
          </div>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Account Credentials
          </Button>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-card" />
            <Skeleton className="h-48 rounded-card" />
          </div>
        ) : credentials.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No credentials configured"
            description="You need to connect at least one MooGold partner account before routing proxy orders."
            actionText="Add Credentials"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className={`p-6 rounded-card border bg-dark-surface/50 flex flex-col justify-between gap-4 shadow-xl transition-all relative ${
                  cred.is_default
                    ? 'border-brand/40 ring-1 ring-brand/10 shadow-brand/5'
                    : 'border-dark-border hover:border-dark-border/80'
                }`}
              >
                {/* Default badge tag */}
                {cred.is_default && (
                  <span className="absolute top-4 right-4 bg-brand/10 border border-brand/20 text-brand text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded flex items-center gap-1 select-none">
                    <Check className="w-3 h-3" />
                    Default
                  </span>
                )}

                {/* Body Details */}
                <div className="flex flex-col gap-1.5 text-left select-text">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest select-none">
                    Account Label
                  </span>
                  <h3 className="text-lg font-bold text-gray-200 truncate pr-16">{cred.label}</h3>

                  <div className="flex gap-4 mt-3 text-xs select-none">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-500">Partner ID</span>
                      <span className="font-mono text-gray-300 font-medium select-all">{cred.partner_id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-500">Env Scopes</span>
                      <Badge variant={cred.environment === 'production' ? 'info' : 'warning'} className="w-max px-2">
                        {cred.environment}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-500">API Status</span>
                      {(() => {
                        const status = cardStatuses[cred.id];
                        if (!status) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-gray-500 text-[11px] font-semibold mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                              Untested
                            </span>
                          );
                        }
                        return status.success ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold mt-0.5" title={status.message}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold mt-0.5" title={status.message}>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Failed
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Operations Buttons */}
                <div className="flex items-center justify-between gap-2 mt-4 border-t border-dark-border/30 pt-4 select-none">
                  <div className="flex items-center gap-2">
                    {/* Default selector */}
                    {!cred.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold hover:bg-brand/5 hover:text-brand"
                        onClick={() => setDefault(cred.id)}
                        disabled={isSettingDefault}
                      >
                        Set Default
                      </Button>
                    )}
                    
                    {/* Test Connection */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-semibold hover:bg-emerald-500/5 hover:text-emerald-400 flex items-center gap-1 h-8 px-2"
                      onClick={() => handleTestConnection(cred.id)}
                      loading={testingCredId === cred.id}
                      disabled={isTesting}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Test
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cred)}
                      className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-dark-bg/60 transition-colors"
                      title="Edit Account Info"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cred.id)}
                      className="p-1.5 rounded text-red-500/80 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      title="Delete Credentials"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCredId ? 'Edit MooGold Credentials' : 'Add MooGold Account'}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
            <Input
              label="Account Label"
              placeholder="e.g. MooGold Production Client"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />

            <Input
              label="Partner ID"
              placeholder="Enter MooGold Partner ID"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              required
            />

            <Input
              type="password"
              label={editingCredId ? 'Secret Key (Leave blank to keep current)' : 'Secret Key'}
              placeholder={editingCredId ? '••••••••' : 'Enter MooGold API Secret Key'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required={!editingCredId}
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Scope</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEnvironment('production')}
                  className={`h-11 rounded-btn border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    environment === 'production'
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-dark-border text-gray-400 hover:bg-dark-surface'
                  }`}
                >
                  Production
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('uat')}
                  className={`h-11 rounded-btn border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    environment === 'uat'
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-dark-border text-gray-400 hover:bg-dark-surface'
                  }`}
                >
                  Sandbox (UAT)
                </button>
              </div>
            </div>

            {modalTestStatus && (
              <div className={`p-3 rounded-lg text-xs border ${
                modalTestStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {modalTestStatus.success ? (
                  <span className="font-semibold">🟢 {modalTestStatus.message}</span>
                ) : (
                  <span className="font-semibold">🔴 {modalTestStatus.message}</span>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-3 select-none">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 text-sm font-semibold h-10"
                onClick={handleTestUnsaved}
                loading={isTestingDirect}
                disabled={!partnerId.trim() || (!editingCredId && !secretKey.trim())}
              >
                Test Connection
              </Button>
              <Button type="submit" variant="primary" className="flex-1 text-sm font-semibold h-10" loading={isCreating || isUpdating}>
                {editingCredId ? 'Save Changes' : 'Connect Account'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete MooGold Credentials"
          message="Are you sure you want to delete these credentials? Transactions routed through this account will fail immediately."
          confirmText="Delete Credentials"
          loading={isDeleting}
        />
      </div>
    </PageWrapper>
  );
};
export default Credentials;
