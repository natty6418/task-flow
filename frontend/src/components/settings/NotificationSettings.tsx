// components/settings/NotificationSettings.tsx
import React from 'react';
import SectionCard from '@/components/dashboard/SectionCard'; // Adjust path if needed

const NotificationSettings: React.FC = () => {
  // Add state for checkboxes later
  return (
    <SectionCard title="Notifications" description="Manage how you receive notifications from us.">
      <form className="space-y-4">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-900">Email Notifications</legend>
           <div className="relative flex items-start">
             <div className="flex h-6 items-center">
               <input
                id="email-tasks"
                name="email-tasks"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                 // Add checked and onChange
               />
             </div>
             <div className="ml-3 text-sm leading-6">
               <label htmlFor="email-tasks" className="font-medium text-gray-900">
                 Task Updates
               </label>
               <p className="text-gray-500">Get notified when tasks are assigned, updated, or due.</p>
             </div>
           </div>
            <div className="relative flex items-start">
             <div className="flex h-6 items-center">
               <input
                id="email-mentions"
                name="email-mentions"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                 // Add checked and onChange
               />
             </div>
             <div className="ml-3 text-sm leading-6">
               <label htmlFor="email-mentions" className="font-medium text-gray-900">
                 Mentions
               </label>
               <p className="text-gray-500">Get notified when someone mentions you in a comment.</p>
             </div>
           </div>
          <div className="relative flex items-start">
             <div className="flex h-6 items-center">
               <input
                id="email-newsletter"
                name="email-newsletter"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                 // Add checked and onChange
               />
             </div>
             <div className="ml-3 text-sm leading-6">
               <label htmlFor="email-newsletter" className="font-medium text-gray-900">
                 Newsletter
               </label>
               <p className="text-gray-500">Receive occasional product updates and news.</p>
             </div>
           </div>
        </fieldset>

        {/* Placeholder for Push Notifications */}
         <fieldset className="space-y-3 pt-4 border-t border-gray-200">
          <legend className="text-sm font-medium text-gray-900">Push Notifications</legend>
           {/* Add push notification options here if applicable */}
           <p className="text-sm text-gray-500">Push notifications are currently not available.</p>
        </fieldset>

         <div className="pt-2 text-right">
          <button
            type="submit" // Or handle saving differently
            className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

export default NotificationSettings;