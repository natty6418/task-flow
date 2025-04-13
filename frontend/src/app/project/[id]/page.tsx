"use client";

import { useParams } from "next/navigation"; 
import { useEffect, useState } from "react";
import ProjectDetails from "@/components/ProjectDetails";
import Loader from "@/components/Loader";
import {Project} from "@/types/type"; // Adjust the import path as necessary
import API from "@/services/api";

export default function ProjectPage() {
  const params = useParams(); // Access route parameters
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const res = await API.get(`/project/${id}`, { withCredentials: true });
          setProject(res.data);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch project:", error);
          setLoading(false);
        }
      };

      fetchProject();
    }
  }, [id]);

  if (loading) return <Loader />;

  if (!project) return <p className="text-center text-gray-500 mt-10">Project not found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <ProjectDetails project={project} />
    </div>
  );
}
