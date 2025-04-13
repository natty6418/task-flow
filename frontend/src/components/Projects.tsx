"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';
import API from "@/services/api";
import DashboardCard from "./DashboardCard";
import { Project } from "@/types/type";
import { Link as LucidLink } from "lucide-react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";


export default function Projects() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/project/", { withCredentials: true });
        setProjects(res.data);
        setLoadingProjects(false);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again.");
        setLoadingProjects(false);
      }
    };

    if (user && !loading) {
      fetchProjects();
    }
  }, [user, loading]);

  if (loading || loadingProjects) {
    return <div className="p-6 text-center text-lg">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">My Projects</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <DashboardCard key={project.id} title={project.name}>
            <p>{project.description || "No description available."}</p>
            <div className="mt-4 flex justify-end">
                <Link href={`/project/${project.id}`} className="text-blue-500 hover:text-blue-700">
                  <LucidLink className="w-6 h-6" />
                </Link>
            </div>
            
          </DashboardCard>
        ))}
        <Link href="/project/create" className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors">
          <PlusCircle className="w-8 h-8 text-gray-500" />
        </Link>
      </div>

      
    </div>
  );
}

