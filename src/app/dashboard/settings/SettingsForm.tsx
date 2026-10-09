'use client';

import { useState } from 'react';

export default function SettingsForm({ initialName, email }: { initialName: string | null; email: string }) {
  const [name, setName] = useState(initialName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingName(true);
    setNameMessage(null);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      setNameMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setNameMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmittingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPassword(true);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      setIsSubmittingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">Profile Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          {nameMessage && (
            <div className={`p-3 rounded-md text-sm ${nameMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {nameMessage.text}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input 
              type="email" 
              disabled 
              value={email} 
              className="appearance-none block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Your email address cannot be changed.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingName}
            className={`px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg text-sm font-medium transition-colors ${isSubmittingName ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800 dark:hover:bg-gray-200'}`}
          >
            {isSubmittingName ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">Change Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          {passwordMessage && (
            <div className={`p-3 rounded-md text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {passwordMessage.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input 
              type="password" 
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input 
              type="password" 
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingPassword}
            className={`px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg text-sm font-medium transition-colors ${isSubmittingPassword ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800 dark:hover:bg-gray-200'}`}
          >
            {isSubmittingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  );
}
