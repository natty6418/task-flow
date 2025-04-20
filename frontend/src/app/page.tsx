"use client";
import { useAuth } from "@/contexts/AuthContext";

import TaskOverview from '@/components/dashboard/TaskOverview';
import MyTasks from '@/components/dashboard/MyTasks';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import Projects from '@/components/dashboard/Projects';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SideBar from "@/components/SideBar"; // Example sidebar component
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { Status } from '@/types/type';

// import Projects from "@/components/Projects";
// A reusable Card component

export default function Dashboard() {
  const { user, loading, projects, loadingProjects, loadingTasks, tasks, setTasks } = useAuth();

  if (loading || loadingProjects || loadingTasks) {
    return <Loader />;
  }

  if (!user) {
    return <p>Unauthorized</p>; // or redirect to login page
  }

  // Placeholder for sidebar navigation items

  return (
    <div className="flex h-screen bg-gray-100 ">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="p-4 md:p-8 space-y-6">
      {/* Task Overview Section */}
      <TaskOverview 
      totalTasks={tasks.length}
      completedTasks={tasks.filter(task => task.status === Status['DONE']).length}
      inProgressTasks={tasks.filter(task => task.status === Status['IN_PROGRESS']).length}
       />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (My Tasks and Projects) */}
        <div className="lg:col-span-2 space-y-6">
           <MyTasks tasks={tasks} setTasks={setTasks}/>
           <Projects projects={projects} />
        </div>

        {/* Right Column (Calendar and Activity) */}
        <div className="lg:col-span-1 space-y-6">
           <CalendarWidget />
           <ActivityFeed />
        </div>
      </div>
    </main>
      </div>
    </div>
  );
}
