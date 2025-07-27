"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Project, Status } from '@/types/type';
import { Folder, Users, Calendar, Plus, MoreVertical, Settings, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Loader from '@/components/common/Loader';
import { CreateProjectModal } from '@/components/modals';
import { format } from 'date-fns';

const ProjectsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, loadingProjects, tasks } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'owned' | 'member'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on user role and search query
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'owned':
        return project.ownerId === user?.id;
      case 'member':
        return project.ownerId !== user?.id;
      default:
        return true;
    }
  });

  // Get project statistics
  const getProjectStats = (project: Project) => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const completedTasks = projectTasks.filter(task => task.status === Status.DONE);
    const inProgressTasks = projectTasks.filter(task => task.status === Status.IN_PROGRESS);
    const todoTasks = projectTasks.filter(task => task.status === Status.TODO);
    
    return {
      total: projectTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      todo: todoTasks.length,
      completionRate: projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
    };
  };

  // Get project role for current user
  const getUserRole = (project: Project) => {
    if (project.ownerId === user?.id) return 'Owner';
    return 'Member';
  };

  if (authLoading || loadingProjects) {
    return <Loader />;
  }

  if (!user) {
    return <div>Please log in to view projects</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">Manage and collaborate on your projects</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Projects ({projects.length})
              </button>
              <button
                onClick={() => setFilter('owned')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'owned' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Owned ({projects.filter(p => p.ownerId === user?.id).length})
              </button>
              <button
                onClick={() => setFilter('member')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'member' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Member ({projects.filter(p => p.ownerId !== user?.id).length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const stats = getProjectStats(project);
              const userRole = getUserRole(project);
              
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  {/* Project Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Folder className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            userRole === 'Owner' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {userRole}
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Project options"
                          aria-label="Project options"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Project Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                            stats.completionRate === 0 ? 'w-0' : 
                            stats.completionRate < 10 ? 'w-[10%]' :
                            stats.completionRate < 20 ? 'w-[20%]' :
                            stats.completionRate < 30 ? 'w-[30%]' :
                            stats.completionRate < 40 ? 'w-[40%]' :
                            stats.completionRate < 50 ? 'w-[50%]' :
                            stats.completionRate < 60 ? 'w-[60%]' :
                            stats.completionRate < 70 ? 'w-[70%]' :
                            stats.completionRate < 80 ? 'w-[80%]' :
                            stats.completionRate < 90 ? 'w-[90%]' : 'w-full'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Task Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{stats.todo}</span>
                        </div>
                        <span className="text-xs text-gray-500">To Do</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <AlertCircle className="w-3 h-3 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">{stats.inProgress}</span>
                        </div>
                        <span className="text-xs text-gray-500">In Progress</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium text-gray-900">{stats.completed}</span>
                        </div>
                        <span className="text-xs text-gray-500">Done</span>
                      </div>
                    </div>

                    {/* Team Size */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{project.members?.length || 1} member{(project.members?.length || 1) !== 1 ? 's' : ''}</span>
                      <Calendar className="w-4 h-4 ml-2" />
                      <span>{format(new Date(project.createdAt), 'MMM yyyy')}</span>
                    </div>
                  </div>

                  {/* Project Actions */}
                  <div className="border-t border-gray-100 px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/project/${project.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Project
                      </Link>
                      {userRole === 'Owner' && (
                        <button 
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          title="Project settings"
                          aria-label="Project settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search criteria or filters' 
                : 'Create your first project to get started with task management'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default ProjectsPage;
