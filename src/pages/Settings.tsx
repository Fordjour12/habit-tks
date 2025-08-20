import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { state: userState, updateUserSettings, updateUserTier } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState({
    theme: userState.user?.settings.theme || 'light',
    notifications: userState.user?.settings.notifications || true,
    strictMode: userState.user?.settings.strictMode || false,
    autoProgression: userState.user?.settings.autoProgression || true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await updateUserSettings(settings);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierChange = async (tier: string) => {
    if (!confirm(`Are you sure you want to change your tier to ${tier}? This will affect your available habits.`)) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      await updateUserTier(tier);
      setMessage(`Tier updated to ${tier}!`);
    } catch (error) {
      setMessage('Failed to update tier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAccount = async () => {
    if (!confirm('Are you sure you want to reset your account? This will remove all progress and reset you to baseline. This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/setup/reset', { method: 'POST' });
      if (response.ok) {
        setMessage('Account reset successfully! You have been returned to baseline.');
        // Refresh the page to show baseline habits
        window.location.reload();
      } else {
        throw new Error('Failed to reset account');
      }
    } catch (error) {
      setMessage('Failed to reset account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Customize your experience and manage your account preferences
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Account Information */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={userState.user?.name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={userState.user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Tier</label>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                userState.user?.currentTier === 'baseline' ? 'bg-blue-100 text-blue-800' :
                userState.user?.currentTier === 'tier2' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {userState.user?.currentTier === 'baseline' ? 'Baseline' : 
                 userState.user?.currentTier === 'tier2' ? 'Tier 2' : 'Tier 3'}
              </span>
              
              <select
                value={userState.user?.currentTier || 'baseline'}
                onChange={(e) => handleTierChange(e.target.value)}
                disabled={isLoading}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="baseline">Baseline</option>
                <option value="tier2">Tier 2</option>
                <option value="tier3">Tier 3</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
            <input
              type="text"
              value={userState.user?.createdAt ? new Date(userState.user.createdAt).toLocaleDateString() : ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
        </div>
        
        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Theme</h3>
              <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Receive reminders and progress updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Strict Mode */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Strict Mode</h3>
              <p className="text-sm text-gray-600">Enforce stricter progression rules and penalties</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.strictMode}
                onChange={(e) => handleSettingChange('strictMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Auto Progression */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Auto Progression</h3>
              <p className="text-sm text-gray-600">Automatically unlock higher tiers when conditions are met</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoProgression}
                onChange={(e) => handleSettingChange('autoProgression', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-red-900 mb-2">Reset Account</h3>
            <p className="text-sm text-red-700 mb-4">
              This will reset your account to baseline, removing all progress and returning you to the starting point.
              This action cannot be undone.
            </p>
            <button
              onClick={handleResetAccount}
              disabled={isLoading}
              className="btn-danger"
            >
              {isLoading ? 'Resetting...' : 'Reset Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
