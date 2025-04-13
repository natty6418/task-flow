import {User} from "@/types/type";
import { Users, Mail, UserPlus } from 'lucide-react';

export default function MembersList({ members, setShowAddMemberModal }: { members: User[], setShowAddMemberModal: (showAddMemberModal : boolean) => void}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Members</h2>
        </div>
        <button 
        onClick={() => setShowAddMemberModal(true)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {members?.length > 0 ? (
        <ul className="space-y-3">
          {members.map(member => (
            <li 
              key={member.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>
              
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No members yet</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => setShowAddMemberModal(true)}
          >
            Invite team members
          </button>
        </div>
      )}
    </div>
  );
}