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
      <div className="space-y-3">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0"
            >
              <Link href={`project/${project.id}`} className="font-medium text-gray-800 underline">{project.name}</Link>
              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    title={member.name}
                    className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center"
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {project.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm pt-2">No projects yet</div>
        )}
      </div>
    </SectionCard>
  );
};

export default Projects;
