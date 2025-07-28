// components/settings/AccountSettings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/services/userService';
import { AuthProvider } from '@/types/type';
import { User, Mail, Lock, Save, X, Loader, AlertCircle } from 'lucide-react';
import { deleteAccount } from '@/services/authService';
const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateUser({
        name: profileData.name,
        email: profileData.email
      });

      setSuccess('Profile updated successfully');
      setIsEditingProfile(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditingProfile(false);
    setError(null);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setShowConfirmDeleteModal(true);
    setEmailConfirmation('');
    setPasswordConfirmation('');
    setError(null);
  };

  const handleFinalDelete = async () => {
    if (emailConfirmation !== user?.email) {
      setError('Email confirmation does not match your account email');
      return;
    }

    if (!passwordConfirmation.trim() && user?.authProvider === AuthProvider.CREDENTIALS) {
      setError('Password is required to delete your account');
      return;
    }

    try {
      setDeleteLoading(true);
      setError(null);
      
      await deleteAccount(passwordConfirmation);
      
      // The deleteAccount service should handle logout and redirect
      // If it doesn't, we might need to handle it here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setShowConfirmDeleteModal(false);
    setEmailConfirmation('');
    setPasswordConfirmation('');
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
        <p className="text-sm text-gray-600 mt-1">Manage your account security and settings.</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Information Section */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Profile Information</h4>
          
          {/* Name */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">Full Name</h5>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="mt-1 w-full text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-300"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">{user?.name || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">Email Address</h5>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="mt-1 w-full text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-300"
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">{user?.email || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit/Save Controls */}
          <div className="flex justify-end mt-4 space-x-3">
            {isEditingProfile ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-0 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        {/* Security Section */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Security</h4>
          
          {/* Password - Only show for credentials auth provider */}
          {user?.authProvider === AuthProvider.CREDENTIALS && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Password</h5>
                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-0 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

          {/* Auth Provider Info for non-credentials users */}
          {user?.authProvider !== AuthProvider.CREDENTIALS && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Authentication</h5>
                  <p className="text-sm text-gray-600">
                    Signed in with {user?.authProvider === AuthProvider.GOOGLE ? 'Google' : 'GitHub'}. 
                    Password management is handled by your provider.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Section */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Subscription</h4>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Current Plan</h5>
                  <p className="text-sm text-gray-600">Free Tier - Limited features</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-0 transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-gray-200 pt-8">
          <h4 className="text-base font-medium text-red-600 mb-4">Danger Zone</h4>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-red-900">Delete Account</h5>
                  <p className="text-sm text-red-700">Permanently remove your account and all associated data. This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-0 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals would go here - for now just placeholder alerts */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <p className="text-gray-600 mb-4">Password change functionality would be implemented here.</p>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-0"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* First Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete your account? This will permanently remove:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• All your projects and tasks</li>
                <li>• Your profile and settings</li>
                <li>• All associated data</li>
                <li>• Access to your workspace</li>
              </ul>
              <p className="text-red-600 text-sm font-medium mt-3">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-0 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-0 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Delete Confirmation Modal with Email Verification */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-600">Final Confirmation</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                To confirm account deletion, please provide the following information:
              </p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Your email: <span className="font-medium text-gray-900">{user?.email}</span>
                  </p>
                  <input
                    type="email"
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    placeholder="Type your email address to confirm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-red-500 text-sm"
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Enter your password:
                  </p>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-red-500 text-sm"
                    autoComplete="current-password"
                    disabled={user?.authProvider !== AuthProvider.CREDENTIALS}
                  />
                </div>
              </div>
              
              {error && (
                <p className="text-red-600 text-xs mt-3">{error}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalDelete}
                disabled={deleteLoading || emailConfirmation !== user?.email || !passwordConfirmation.trim()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;