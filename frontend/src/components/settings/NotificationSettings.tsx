// components/settings/NotificationSettings.tsx
import React, { useState } from 'react';

interface NotificationState {
  emailTasks: boolean;
  emailMentions: boolean;
  emailNewsletter: boolean;
  pushTasks: boolean;
  pushMentions: boolean;
  pushReminders: boolean;
}

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationState>({
    emailTasks: true,
    emailMentions: true,
    emailNewsletter: false,
    pushTasks: true,
    pushMentions: true,
    pushReminders: false,
  });

  const handleToggle = (key: keyof NotificationState) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    console.log('Saving notification settings:', notifications);
    // Handle save logic here
  };

  const NotificationToggle = ({ 
    id, 
    title, 
    description, 
    checked, 
    onChange 
  }: {
    id: string;
    title: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="ml-4">
        <button
          type="button"
          onClick={onChange}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={checked}
          aria-labelledby={id}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <p className="text-sm text-gray-600 mt-1">Manage how you receive notifications from TaskFlow.</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
          </div>
          
          <div className="space-y-3">
            <NotificationToggle
              id="email-tasks"
              title="Task Updates"
              description="Get notified when tasks are assigned, updated, or due."
              checked={notifications.emailTasks}
              onChange={() => handleToggle('emailTasks')}
            />
            
            <NotificationToggle
              id="email-mentions"
              title="Mentions & Comments"
              description="Get notified when someone mentions you in a comment."
              checked={notifications.emailMentions}
              onChange={() => handleToggle('emailMentions')}
            />
            
            <NotificationToggle
              id="email-newsletter"
              title="Newsletter & Updates"
              description="Receive our weekly newsletter and product updates."
              checked={notifications.emailNewsletter}
              onChange={() => handleToggle('emailNewsletter')}
            />
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-base font-medium text-gray-900">Push Notifications</h4>
          </div>
          
          <div className="space-y-3">
            <NotificationToggle
              id="push-tasks"
              title="Task Reminders"
              description="Get push notifications for task deadlines and updates."
              checked={notifications.pushTasks}
              onChange={() => handleToggle('pushTasks')}
            />
            
            <NotificationToggle
              id="push-mentions"
              title="Real-time Mentions"
              description="Instant notifications when you&apos;re mentioned."
              checked={notifications.pushMentions}
              onChange={() => handleToggle('pushMentions')}
            />
            
            <NotificationToggle
              id="push-reminders"
              title="Daily Reminders"
              description="Daily summary of your tasks and upcoming deadlines."
              checked={notifications.pushReminders}
              onChange={() => handleToggle('pushReminders')}
            />
          </div>
        </div>

        {/* Notification Schedule */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Notification Schedule</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiet Hours Start
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="22:00">10:00 PM</option>
                  <option value="23:00">11:00 PM</option>
                  <option value="00:00">12:00 AM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiet Hours End
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              During quiet hours, you&apos;ll only receive notifications for urgent items.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;