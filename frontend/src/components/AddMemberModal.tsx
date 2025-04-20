"use client";

import { useState } from "react";
import API from "@/services/api";
import { Role } from "@/types/type"; // Assuming you have your enums here
import {ProjectMember} from "@/types/type"; // Assuming you have your User type here

export default function AddMemberModal({ projectId,setMembers, onClose }: { projectId: string, setMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>, onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.MEMBER); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await API.post(`/project/addMember/${projectId}`, {
        email,
        role,
      }, { withCredentials: true });

      if (res.status !== 201) {
        throw new Error("Failed to add member");
      }
      const member = res.data;
      console.log("Member added:", member);
      setMembers((prevMembers: ProjectMember[]) => [...prevMembers, member]);

      setSuccess("Member added successfully!");
      setEmail("");
      setRole(Role.MEMBER);
      
    } catch (err) {
      console.error("Failed to add member:", err);
      setError("Failed to add member. Make sure the email is correct.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          Add Member
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value={Role.ADMIN}>Admin</option>
              <option value={Role.MEMBER}>Member</option>
              <option value={Role.VIEWER}>Viewer</option>
            </select>
          </div>

          {/* Show error or success messages */}
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          {success && <p className="text-green-500 text-center text-sm">{success}</p>}

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
