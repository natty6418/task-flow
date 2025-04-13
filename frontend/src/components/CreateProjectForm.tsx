"use client";

import { useState } from "react";
import API from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "./Loader";

export default function CreateProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await API.post("/project/create", {
        name,
        description,
      }, { withCredentials: true });

      console.log("Project created:", res.data);
      router.push("/"); 
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-6"
    >
      {/* Project Name */}
      <div className="flex flex-col">
        <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g., Marketing Website Redesign"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Project Description */}
      <div className="flex flex-col">
        <label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Brief description of the project goals and timeline..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        ></textarea>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-center text-red-500 text-sm">{error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-all duration-300 disabled:bg-gray-400"
      >
        {loading ? <Loader /> : "Create Project"}
      </button>
    </form>
  );
}
