import React, { useState } from 'react';
import { Users, UserCheck, UserX, Search, ShieldAlert, RefreshCw } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers.js';
import { useAuthStore } from '../../stores/authStore.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { formatDate } from '../../lib/utils.js';

export const Admin: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    stats,
    isLoading,
    refetch,
    approveUser,
    isApproving,
    disapproveUser,
    isDisapproving
  } = useAdminUsers();

  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      await approveUser(userId);
    } finally {
      setSelectedUserId(null);
    }
  };

  const promptDisapprove = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setConfirmOpen(true);
  };

  const handleConfirmDisapprove = async () => {
    if (selectedUserId) {
      try {
        await disapproveUser(selectedUserId);
      } finally {
        setConfirmOpen(false);
        setSelectedUserId(null);
      }
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 text-left">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div>
            <h2 className="text-xl font-bold text-gray-200">Admin Panel</h2>
            <p className="text-xs text-gray-500 mt-1">Review developer registration requests and manage gateway access rights</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh List
          </Button>
        </div>

        {/* User Stats Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
          {/* Card 1: Total */}
          <div className="p-5 bg-dark-surface border border-dark-border rounded-card flex items-center justify-between shadow-xl">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Registers</span>
              {isLoading ? (
                <Skeleton className="h-8 w-14 rounded-md" />
              ) : (
                <span className="text-2xl font-extrabold text-gray-200 tracking-tight">{stats.total}</span>
              )}
            </div>
            <div className="p-2.5 rounded-lg border border-indigo-500/15 bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Approved */}
          <div className="p-5 bg-dark-surface border border-dark-border rounded-card flex items-center justify-between shadow-xl">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved API Users</span>
              {isLoading ? (
                <Skeleton className="h-8 w-14 rounded-md" />
              ) : (
                <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">{stats.approved}</span>
              )}
            </div>
            <div className="p-2.5 rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="p-5 bg-dark-surface border border-dark-border rounded-card flex items-center justify-between shadow-xl">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Awaiting Approval</span>
              {isLoading ? (
                <Skeleton className="h-8 w-14 rounded-md" />
              ) : (
                <span className="text-2xl font-extrabold text-amber-500 tracking-tight">{stats.pending}</span>
              )}
            </div>
            <div className="p-2.5 rounded-lg border border-amber-500/15 bg-amber-500/10 text-amber-500">
              <UserX className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* User Registry Controls & Table */}
        <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search registry (name, email)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-dark-bg border border-dark-border text-gray-200 text-sm rounded-input outline-none transition-colors placeholder-gray-600 focus:border-brand/40"
              />
            </div>
            <div className="text-xs font-medium text-gray-500 select-none">
              Showing {filteredUsers.length} of {users.length} registered developers
            </div>
          </div>

          {/* Table container */}
          {isLoading ? (
            <div className="flex flex-col gap-2.5">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 border border-dashed border-dark-border rounded-lg flex flex-col items-center justify-center text-center px-4 select-none">
              <ShieldAlert className="w-10 h-10 text-gray-600 mb-3" />
              <h3 className="text-sm font-semibold text-gray-400">No registry matches</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">Adjust your query or check back later once new accounts register.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-dark-border/60 text-gray-500 text-xs font-semibold uppercase tracking-wider select-none bg-dark-bg/25">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">API Approval Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 select-text">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-dark-bg/10 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center text-brand font-bold uppercase text-xs flex-shrink-0">
                            {u.name.substring(0, 2)}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-semibold text-gray-300 truncate">{u.name}</span>
                            <span className="text-[11px] text-gray-500 truncate font-mono">{u.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={u.role === 'admin' ? 'info' : 'default'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="p-4">
                          <Badge variant={u.is_approved ? 'success' : 'warning'}>
                            {u.is_approved ? 'Approved' : 'Pending Approval'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {isSelf ? (
                            <span className="text-[10px] text-gray-500 font-semibold select-none pr-3">
                              Active Admin (You)
                            </span>
                          ) : u.is_approved ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => promptDisapprove(u.id, u.name)}
                              loading={isDisapproving && selectedUserId === u.id}
                              className="h-8 px-3 text-xs font-semibold"
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(u.id)}
                              loading={isApproving && selectedUserId === u.id}
                              className="h-8 px-3 text-xs font-semibold"
                            >
                              Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDisapprove}
        title="Revoke User Approval"
        message={`Are you sure you want to revoke gateway access for ${selectedUserName}? Their credentials will be saved, but all active API keys will be immediately blocked from invoking proxy requests.`}
        confirmText="Revoke Access"
        cancelText="Cancel"
        variant="danger"
        loading={isDisapproving}
      />
    </PageWrapper>
  );
};

export default Admin;
