"use client";

import { MoreVertical } from "lucide-react";
import { Project } from "@/types/type";

interface ProjectHeaderProps {
  project: Project;
  name: string;
  description: string;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  confirmLeave: () => void;
}

export default function ProjectHeader({
  project,
  name,
  description,
  setName,
  setDescription,
  menuOpen,
  setMenuOpen,
  confirmLeave,
}: ProjectHeaderProps) {

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 relative mb-4">
      {/* Dropdown Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-white/60 transition-colors"
          title="Project options"
          aria-label="Project options"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={confirmLeave}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg m-1"
            >
              Leave Project
            </button>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="mb-6">
        <h1
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setName(e.target.innerText)}
          className="text-3xl font-bold text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
        >
          {name}
        </h1>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a project description..."
          className="w-full text-gray-600 text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -m-2 bg-transparent border-none resize-none overflow-hidden min-h-[2.5rem]"
          rows={2}
        />
      </div>



      {/* Project Meta */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
        <span>Last updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
