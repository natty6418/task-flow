import React, { useState } from 'react';
import { Calendar, Activity, X } from 'lucide-react';
import CalendarWidget from './CalendarWidget';
import RecentActivity from './ActivityFeed';

interface TabbedSidebarProps {
  onDateSelect?: (date: Date | null) => void;
  selectedDate?: Date | null;
  className?: string;
}

const TabbedSidebar: React.FC<TabbedSidebarProps> = ({ 
  onDateSelect, 
  selectedDate, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'activity'>('calendar');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden fixed bottom-4 left-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors ${
          isExpanded ? 'hidden' : ''
        }`}
        onClick={() => setIsExpanded(true)}
        title="Open sidebar"
        aria-label="Open sidebar"
      >
        <Calendar className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isExpanded && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsExpanded(false)} />
      )}

      {/* Sidebar Content */}
      <div
        className={`
          ${className}
          bg-white rounded-lg shadow-sm border border-gray-200
          md:relative md:translate-x-0 md:w-full
          ${isExpanded 
            ? 'fixed bottom-0 left-0 right-0 z-50 rounded-t-lg rounded-b-none max-h-[80vh] overflow-auto' 
            : 'hidden md:block'
          }
        `}
      >
        {/* Mobile Header */}
        {isExpanded && (
          <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Dashboard Tools</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'calendar' | 'activity')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {activeTab === 'calendar' ? (
            <CalendarWidget onDateSelect={onDateSelect} selectedDate={selectedDate} />
          ) : (
            <RecentActivity numActivities={5}/>
          )}
        </div>
      </div>
    </>
  );
};

export default TabbedSidebar;
