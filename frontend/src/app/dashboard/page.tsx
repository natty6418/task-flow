"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

import TaskOverview from '@/components/dashboard/TaskOverview';
import MyTasks from '@/components/dashboard/MyTasks';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import Projects from '@/components/dashboard/Projects';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SideBar from "@/components/SideBar"; // Example sidebar component
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import CreateProjectModal from "@/components/CreateProjectModal";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Status } from '@/types/type';

export default function Dashboard() {
  const { user, loading, projects, loadingProjects, loadingTasks, tasks, setTasks } = useAuth();
  
  // Modal states
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);

  if (loading || loadingProjects || loadingTasks) {
    return <Loader />;
  }

  if (!user) {
    return <p>Unauthorized</p>; // or redirect to login page
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Content Area with Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 space-y-6 overflow-auto">
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

      {/* Floating Action Button */}
      <FloatingActionButton
        setShowCreateProjectModal={setShowCreateProjectModal}
        
      />

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
      />
      
      {/* TODO: Add other modals when they're implemented */}
      {/* {showTaskModal && <NewTaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} />} */}
      {/* {showAddMemberModal && <AddMemberModal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} />} */}
      {/* {showAddBoardModal && <AddBoardModal isOpen={showAddBoardModal} onClose={() => setShowAddBoardModal(false)} />} */}
    </div>
  );
}
