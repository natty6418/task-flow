// components/dashboard/ActivityFeed.tsx
import React from 'react';
import SectionCard from './SectionCard';

const ActivityFeed: React.FC = () => {
  return (
    <SectionCard title="Activity Feed" className="min-h-[200px]">
      <div className="space-y-3">
        {/* Placeholder for activity items */}
        {[1, 2, 3, 4].map((i) => (
           <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
        ))}
        <div className="text-center text-gray-400 text-sm pt-2">No recent activity</div>
      </div>
    </SectionCard>
  );
};

export default ActivityFeed;