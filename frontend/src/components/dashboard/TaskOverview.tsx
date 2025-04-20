// components/dashboard/TaskOverview.tsx
import React from 'react';
import StatCard from './StatCard';
import Link from 'next/link';

interface TaskOverviewProps {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({totalTasks, completedTasks, inProgressTasks}) => {
  // Replace with actual data fetching later

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={totalTasks} />
        <StatCard title="Completed" value={completedTasks} />
        <StatCard title="In Progress" value={inProgressTasks} />
        <StatCard title="Quick Add">
           {/* You can make this a button */}
          <Link href={"/project/create"} className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
            Create Project
          </Link>
        </StatCard>
      </div>
    </section>
  );
};

export default TaskOverview;