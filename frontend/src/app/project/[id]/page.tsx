"use client";

import { useParams } from "next/navigation"; 
import { useEffect, useState, useRef, useCallback } from "react";
import ProjectDetails from "@/components/project/ProjectDetails";
import Loader from "@/components/common/Loader";
import { Project } from "@/types/type";
import { useApp } from "@/contexts/AppContext";
import { fetchProjectById } from "@/services/projectService";


export default function ProjectPage() {
  const params = useParams();
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projects, setProjects } = useApp();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id || typeof id !== 'string' || hasLoadedRef.current) {
        setLoading(false);
        return;
      }

      hasLoadedRef.current = true;

      try {
        setError(null);

        
        // Check if project exists in context first
        const existingProject = projects.find((p) => p.id === id);
        if (existingProject && project) {
          setProject(existingProject);
          setLoading(false);
          return;
        }

        // Fetch from API if not in context
        const fetchedProject = await fetchProjectById(id);
        setProject(fetchedProject);
        
        // Update context with fetched project
        setProjects((prev) => {
          const exists = prev.some(p => p.id === fetchedProject.id);
          return exists ? prev : [...prev, fetchedProject];
        });
        
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setError("Failed to load project. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, projects, setProjects, project]); // Keep all dependencies but use ref to prevent re-runs

  // Handle project updates from child component
  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setProject(updatedProject);
    setProjects((prev) => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
  }, [setProjects]);

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!project) return <p className="text-center text-gray-500 mt-10">Project not found.</p>;

  return (
    <ProjectDetails 
      project={project} 
      setProject={handleProjectUpdate} 
    />
  );
}
