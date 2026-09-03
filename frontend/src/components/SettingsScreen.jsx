import React, { useState } from 'react';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profilePublic: true,
      showActivity: false
    },
    language: 'English',
    currency: 'PKR'
  });

  const toggleSetting = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const changeLanguage = (lang) => {
    setSettings(prev => ({
      ...prev,
      language: lang
    }));
  };

  const changeCurrency = (curr) => {
    setSettings(prev => ({
      ...prev,
      currency: curr
    }));
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">Settings</h1>
        <p className="text-[color:var(--text-secondary)] mb-8">Manage your account preferences</p>
        
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[color:var(--border-primary)]">
                <div>
                  <h3 className="font-medium text-[color:var(--text-primary)]">Profile Visibility</h3>
                  <p className="text-sm text-[color:var(--text-secondary)]">Control who can see your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.profilePublic}
                    onChange={() => toggleSetting('privacy', 'profilePublic')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[color:var(--border-primary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--accent-primary)]"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-[color:var(--border-primary)]">
                <div>
                  <h3 className="font-medium text-[color:var(--text-primary)]">Show Activity</h3>
                  <p className="text-sm text-[color:var(--text-secondary)]">Show your activity on your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showActivity}
                    onChange={() => toggleSetting('privacy', 'showActivity')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[color:var(--border-primary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--accent-primary)]"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[color:var(--border-primary)]">
                <div>
                  <h3 className="font-medium text-[color:var(--text-primary)]">Email Notifications</h3>
                  <p className="text-sm text-[color:var(--text-secondary)]">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={() => toggleSetting('notifications', 'email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[color:var(--border-primary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--accent-primary)]"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-[color:var(--border-primary)]">
                <div>
                  <h3 className="font-medium text-[color:var(--text-primary)]">Push Notifications</h3>
                  <p className="text-sm text-[color:var(--text-secondary)]">Receive push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={() => toggleSetting('notifications', 'push')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[color:var(--border-primary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--accent-primary)]"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-[color:var(--text-primary)]">SMS Notifications</h3>
                  <p className="text-sm text-[color:var(--text-secondary)]">Receive updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={() => toggleSetting('notifications', 'sms')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[color:var(--border-primary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--accent-primary)]"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Language and Currency */}
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-[color:var(--text-primary)] mb-2">Language</h3>
                <select
                  value={settings.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                >
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
              
              <div>
                <h3 className="font-medium text-[color:var(--text-primary)] mb-2">Currency</h3>
                <select
                  value={settings.currency}
                  onChange={(e) => changeCurrency(e.target.value)}
                  className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                >
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Danger Zone</h2>
            <div className="space-y-4">
              <button className="w-full py-3 px-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition text-left">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;