// components/settings/AccountSettings.tsx
import React from 'react';
import SectionCard from '@/components/dashboard/SectionCard'; // Adjust path if needed

const AccountSettings: React.FC = () => {
  // Add state and handlers for actions later
  const handleChangePassword = () => alert('Redirect to change password page or open modal.');
  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion initiated...'); // Replace with actual logic
    }
  };

  return (
    <SectionCard title="Account Management">
      <div className="space-y-4">
        {/* Change Password */}
        <div>
          <h4 className="text-sm font-medium text-gray-800">Password</h4>
          <p className="text-sm text-gray-500 mb-2">Change your account password.</p>
          <button
            type="button"
            onClick={handleChangePassword}
            className="rounded-md border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            Change Password
          </button>
        </div>

        {/* Subscription Placeholder */}
         <div>
          <h4 className="text-sm font-medium text-gray-800">Subscription</h4>
          <p className="text-sm text-gray-500 mb-2">Manage your billing information and subscription plan.</p>
          <p className="text-sm text-gray-600">Current Plan: <span className="font-semibold">Free Tier</span></p>
          {/* Add a link/button to manage subscription */}
          {/* <button type="button" className="...">Manage Subscription</button> */}
        </div>


        {/* Delete Account */}
        <div className="pt-4 border-t border-gray-200">
           <h4 className="text-sm font-medium text-red-600">Delete Account</h4>
           <p className="text-sm text-gray-500 mb-2">Permanently remove your account and all associated data. This action cannot be undone.</p>
           <button
            type="button"
            onClick={handleDeleteAccount}
            className="rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

export default AccountSettings;