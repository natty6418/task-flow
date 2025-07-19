"use client";

import { Users, UserPlus, X } from "lucide-react";
import { ProjectMember, User } from "@/types/type";

interface ProjectMembersPanelProps {
  members: ProjectMember[];
  isAdmin: boolean;
  user: User | null;
  setShowAddMemberModal: (show: boolean) => void;
  handleRemoveMember: (id: string) => Promise<void>;
  removingId: string | null;
}

export default function ProjectMembersPanel({
  members,
  isAdmin,
  user,
  setShowAddMemberModal,
  handleRemoveMember,
  removingId,
}: ProjectMembersPanelProps) {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Team</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {members.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddMemberModal(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Add member"
        >
          <UserPlus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        {members?.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {members.slice(0, 5).map((member) => (
              <div
                key={member.user.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{member.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                </div>
                {(isAdmin && member.user.id !== user?.id) && (
                  <button
                    onClick={() => handleRemoveMember(member.user.id)}
                    disabled={removingId === member.user.id}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove member"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {members.length > 5 && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View all {members.length} members
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-3">No members yet</p>
            <button
              className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setShowAddMemberModal(true)}
            >
              Invite members
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
