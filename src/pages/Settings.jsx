import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Save,
  Moon,
  Sun,
  Settings as SettingsIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(profileData);
    if (result.success) {
      toast.success('Profile updated successfully');
    }

    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }

    setLoading(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    // { id: 'preferences', name: 'Preferences', icon: SettingsIcon }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-6">Profile Information</h3>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="form-label">Full Name</label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          className="form-input pl-10"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          className="form-input pl-10"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{user?.role}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-sm font-medium text-gray-900">
                          <span className="badge badge-success">Active</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="spinner mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="form-label">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        className="form-input pl-10 pr-10"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="       Enter current password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        className="form-input pl-10 pr-10"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="       Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-input pl-10 pr-10"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="       Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Password Requirements</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Mix of letters and numbers recommended</li>
                      <li>• Avoid common passwords</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="spinner mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-6">Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-200">Dark Mode</h4>
                      <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDarkMode ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-200">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email updates about your account</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-200">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive SMS alerts for important updates</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">About This Application</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>Version: {import.meta.env.VITE_APP_VERSION || '3.2.1'}</p>
                    <p>Build: {import.meta.env.MODE === 'development' ? 'Development' : 'Production'}</p>
                    <p>Environment: {import.meta.env.MODE}</p>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


