import React from 'react';
import SectionCard from './SectionCard';
import { Project } from '@/types/type';
import Link from 'next/link';

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <SectionCard title="Projects">
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => {
            // Calculate project progress
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter(task => task.status === 'DONE').length || 0;
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return (
              <div
                key={project.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link 
                      href={`project/${project.id}`} 
                      className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      {project.name}
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                      {completedTasks}/{totalTasks} tasks complete
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {project?.members?.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        title={member.name}
                        className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center border-2 border-white"
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project?.members?.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center border-2 border-white">
                        +{project?.members?.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 text-sm pt-8">
            No projects yet. Create your first project to get started!
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default Projects;
