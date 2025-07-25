"use client";
import { ProjectMember } from "@/types/type";
import { Users, Mail, UserPlus, X } from "lucide-react";
import API from "@/services/api";
import {  useState } from "react";
import { Role } from "@/types/type";
import { useAuth } from "@/contexts/AuthContext";

export default function MembersList({
  members,
  setMembers,
  setShowAddMemberModal,
  projectId
}: {
  members: ProjectMember[];
  setMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>;
  setShowAddMemberModal: (show: boolean) => void;
  projectId: string;
}) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const {user} = useAuth();
  const isAdmin = members.some((m) => m.user.id === user?.id && m.role === Role.ADMIN);

  const handleRemoveMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      setRemovingId(id);
      await API.post(`/project/removeMember/${projectId}`, { memberId: id }, { withCredentials: true });
      setMembers((prev) => prev.filter((m) => m.user.id !== id));
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Members</h2>
        </div>
        <button
          aria-label="Add Member"
          onClick={() => setShowAddMemberModal(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {members?.length > 0 ? (
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.user.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{member.user.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{member.user.email}</span>
                  </div>
                </div>
              </div>
              {(isAdmin && member.user.id !== user?.id)&&<button
                onClick={() => handleRemoveMember(member.user.id)}
                disabled={removingId === member.user.id}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Remove member"
              >
                <X className="w-5 h-5" />
              </button>}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No members yet</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => setShowAddMemberModal(true)}
          >
            Invite team members
          </button>
        </div>
      )}
    </div>
  );
}
