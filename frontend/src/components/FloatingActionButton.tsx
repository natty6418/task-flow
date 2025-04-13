import { useState } from 'react';
import { Plus, ClipboardList, UserPlus, LayoutGrid } from 'lucide-react';

export default function FloatingActionButton({
  setShowTaskModal,
  setShowAddMemberModal,
  setShowAddBoardModal,
}: {
  setShowTaskModal: (val: boolean) => void;
  setShowAddMemberModal: (val: boolean) => void;
  setShowAddBoardModal: (val: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed flex flex-col items-end bottom-8 right-8 gap-3 z-50">
      {isExpanded && (
        <>
          <button
            onClick={() => {
              setShowTaskModal(true);
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
          >
            <ClipboardList className="w-5 h-5" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => {
              setShowAddMemberModal(true);
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span>New Member</span>
          </button>

          <button
            onClick={() => {
              setShowAddBoardModal(true);
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
          >
            <LayoutGrid className="w-5 h-5" />
            <span>New Board</span>
          </button>
        </>
      )}

      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
      >
        <Plus className={`w-7 h-7 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
