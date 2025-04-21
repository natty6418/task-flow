"use client";

import ProfileSettings from "@/components/settings/ProfileSettings";
import AccountSettings from "@/components/settings/AccountSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";

export default function SettingsPage() {
  return (
    <main className="p-4 md:p-8">
       <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
        Settings
      </h1>

      <div className="space-y-6">
         {/* Profile Settings Section */}
         <ProfileSettings />

         {/* Account Settings Section */}
         <AccountSettings />

         {/* Notification Settings Section */}
         <NotificationSettings />

         {/* Add more settings sections as needed */}
         {/* e.g., Appearance, Integrations etc. */}
      </div>
    </main>
  );
}