// components/settings/ProfileSettings.tsx
import React from 'react';
import SectionCard from '@/components/dashboard/SectionCard'; // Adjust path if needed

const ProfileSettings: React.FC = () => {
  // Add state management (e.g., useState) later for actual form handling
  return (
    <SectionCard title="Profile Information" description="Update your account's profile information and email address.">
      <form className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            autoComplete="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            // Add value and onChange handler later
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50" // Example: Make it read-only visually
            readOnly // Example: Email might not be changeable
            // Add value and onChange handler later
          />
        </div>

         <div>
           <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            autoComplete="username"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
             // Add value and onChange handler later
          />
        </div>

        {/* Placeholder for Avatar Upload */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="mt-1 flex items-center space-x-4">
                <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                {/* Placeholder for image or SVG */}
                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                </span>
                <button
                type="button"
                className="rounded-md border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                >
                Change
                </button>
            </div>
        </div>


        <div className="pt-2 text-right">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

export default ProfileSettings;