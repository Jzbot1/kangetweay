import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth.js';
import { useUiStore } from '../../stores/uiStore.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Tabs } from '../../components/ui/Tabs.js';
import PageWrapper from '../../components/layout/PageWrapper.js';
import { User, Shield, Bell, KeyRound, Monitor, Smartphone } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email')
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type ProfileFields = z.infer<typeof profileSchema>;
type PasswordFields = z.infer<typeof passwordSchema>;

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useUiStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Form hooks
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema)
  });

  // Mock states
  const [twoFactorActive, setTwoFactorActive] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const onUpdateProfile = async (data: ProfileFields) => {
    setUpdatingProfile(true);
    // Simulate API update
    setTimeout(() => {
      setUpdatingProfile(false);
      addToast('Profile updated successfully', 'success');
    }, 1000);
  };

  const onChangePassword = async (data: PasswordFields) => {
    setUpdatingPassword(true);
    // Simulate API change
    setTimeout(() => {
      setUpdatingPassword(false);
      resetPassword();
      addToast('Password changed successfully', 'success');
    }, 1000);
  };

  const handleToggle2FA = () => {
    setTwoFactorActive(!twoFactorActive);
    addToast(twoFactorActive ? 'Two-Factor Authentication disabled' : 'Two-Factor Authentication enabled', 'info');
  };

  const tabOptions = [
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Access', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> }
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 text-left max-w-4xl">
        <Tabs options={tabOptions} activeId={activeTab} onChange={setActiveTab} className="select-none" />

        <div className="mt-2 select-text">
          {activeTab === 'profile' && (
            <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-6 max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-gray-200">Personal Information</h3>
                <p className="text-xs text-gray-500 mt-1">Update your personal account credentials.</p>
              </div>

              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="flex flex-col gap-5">
                <Input
                  label="Full Name"
                  error={profileErrors.name?.message}
                  disabled={updatingProfile}
                  {...registerProfile('name')}
                />

                <Input
                  type="email"
                  label="Email Address"
                  error={profileErrors.email?.message}
                  disabled={updatingProfile}
                  {...registerProfile('email')}
                />

                <Button type="submit" variant="primary" className="h-10 font-semibold text-sm w-max px-6 mt-2" loading={updatingProfile}>
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-6 max-w-2xl">
              {/* Change Password */}
              <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-6">
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2 select-none">
                  <KeyRound className="w-5 h-5 text-gray-500" />
                  Update Password
                </h3>
                
                <form onSubmit={handlePasswordSubmit(onChangePassword)} className="flex flex-col gap-5">
                  <Input
                    type="password"
                    label="Current Password"
                    placeholder="••••••••"
                    error={passwordErrors.currentPassword?.message}
                    disabled={updatingPassword}
                    {...registerPassword('currentPassword')}
                  />

                  <Input
                    type="password"
                    label="New Password"
                    placeholder="••••••••"
                    error={passwordErrors.newPassword?.message}
                    disabled={updatingPassword}
                    {...registerPassword('newPassword')}
                  />

                  <Input
                    type="password"
                    label="Confirm New Password"
                    placeholder="••••••••"
                    error={passwordErrors.confirmPassword?.message}
                    disabled={updatingPassword}
                    {...registerPassword('confirmPassword')}
                  />

                  <Button type="submit" variant="primary" className="h-10 font-semibold text-sm w-max px-6 mt-2" loading={updatingPassword}>
                    Update Password
                  </Button>
                </form>
              </div>

              {/* Mock 2FA Settings */}
              <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex items-center justify-between gap-6 select-none">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                    Secure your account credentials by requiring a mobile verification token code on login attempts.
                  </p>
                </div>

                {/* Switch sliding toggle */}
                <button
                  onClick={handleToggle2FA}
                  className={`w-12 h-6 rounded-full flex items-center p-0.5 transition-all outline-none ${
                    twoFactorActive ? 'bg-brand' : 'bg-dark-bg border border-dark-border'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                      twoFactorActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Active Sessions */}
              <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-5 select-none">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  Active Login Sessions
                </h3>
                
                <div className="flex flex-col gap-4 divide-y divide-dark-border/40 text-xs">
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-300">Windows Chrome (Current Session)</span>
                      <span className="text-gray-500">127.0.0.1 &bull; Kuala Lumpur, MY</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 bg-dark-surface border border-dark-border rounded-card shadow-xl flex flex-col gap-6 max-w-2xl select-none">
              <div>
                <h3 className="text-base font-bold text-gray-200">Alert Configurations</h3>
                <p className="text-xs text-gray-500 mt-1">Configure platform notification triggers.</p>
              </div>

              <div className="flex flex-col gap-5 text-sm">
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 accent-brand rounded border-dark-border focus:ring-brand/40" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-300">Order Failure Alerts</span>
                    <span className="text-xs text-gray-500">Notify my email address immediately when background top-ups fail.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 accent-brand rounded border-dark-border focus:ring-brand/40" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-300">MooGold Account Balance warnings</span>
                    <span className="text-xs text-gray-500">Trigger warnings when remaining wallet balance drops below $100.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input type="checkbox" className="mt-1 accent-brand rounded border-dark-border focus:ring-brand/40" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-300">Weekly Digest Reports</span>
                    <span className="text-xs text-gray-500">Weekly email summaries compiling total calls, errors rate, and latencies.</span>
                  </div>
                </label>

                <Button variant="primary" size="sm" className="h-10 font-semibold text-sm w-max px-6 mt-4" onClick={() => addToast('Notification settings saved', 'success')}>
                  Save Configurations
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
export default Settings;
