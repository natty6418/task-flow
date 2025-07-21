"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";

import UnifiedTaskPanel from '@/components/dashboard/UnifiedTaskPanel';
import Projects from '@/components/dashboard/Projects';
import TabbedSidebar from '@/components/dashboard/TabbedSidebar';
import SideBar from "@/components/layout/SideBar";
import Header from "@/components/layout/Header";
import Loader from "@/components/common/Loader";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { Status } from '@/types/type';
import FloatingActionButton from "@/components/common/FloatingActionButton";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { projects, loadingProjects, loadingTasks, tasks, setTasks } = useApp();
  
  // Modal states
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  
  // Date filtering state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (loading || loadingProjects || loadingTasks) {
    return <Loader />;
  }

  if (!user) {
    return <p>Unauthorized</p>; // or redirect to login page
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      <FloatingActionButton
        setShowCreateProjectModal={setShowCreateProjectModal}
      />

      {/* Header */}
      <Header />

      {/* Content Area with Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 space-y-6 overflow-auto">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Unified Task Panel */}
            <div className="lg:col-span-2">
              <UnifiedTaskPanel 
                tasks={tasks}
                setTasks={setTasks}
                filteredDate={selectedDate}
                totalTasks={tasks.length}
                completedTasks={tasks.filter(task => task.status === Status['DONE']).length}
                inProgressTasks={tasks.filter(task => task.status === Status['IN_PROGRESS']).length}
              />
            </div>

            {/* Right Column - Tabbed Sidebar and Projects (Desktop) */}
            <div className="lg:col-span-1 hidden lg:block space-y-6">
              <TabbedSidebar 
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
              />
              <Projects projects={projects} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Tabbed Sidebar and Projects */}
      {/* Mobile Tabbed Sidebar and Projects */}
      <div className="lg:hidden space-y-4 p-4">
        <TabbedSidebar 
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
        <Projects projects={projects} />
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
      />
    </div>
  );
}
