import { useState } from 'react';
import { Plus, ClipboardList, UserPlus, LayoutGrid, FolderPlus } from 'lucide-react';

export default function FloatingActionButton({
  setShowTaskModal,
  setShowAddMemberModal,
  setShowAddBoardModal,
  setShowCreateProjectModal,
}: {
  setShowTaskModal?: (val: boolean) => void;
  setShowAddMemberModal?: (val: boolean) => void;
  setShowAddBoardModal?: (val: boolean) => void;
  setShowCreateProjectModal?: (val: boolean) => void;

}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed flex flex-col items-end bottom-8 right-8 gap-3 z-50">
      {isExpanded && (
        <>
        {
          setShowCreateProjectModal &&
          <button
            onClick={() => {
              setShowCreateProjectModal(true);
              setIsExpanded(false);
            }}
            className={`flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all`}
          >
            <FolderPlus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        }
        {
          setShowTaskModal &&
          <button
            onClick={() => {
              setShowTaskModal(true);
              setIsExpanded(false);
            }}
            className={`flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all `}
          >
            <ClipboardList className="w-5 h-5" />
            <span>New Task</span>
          </button>
        }
        {
          setShowAddMemberModal && (
            <button
              onClick={() => {
                setShowAddMemberModal(true);
                setIsExpanded(false);
                }}
            className={`flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all `}
          >
            <UserPlus className="w-5 h-5" />
            <span>New Member</span>
          </button>
          )
        }
        {
          setShowAddBoardModal && (
          <button
            onClick={() => {
              setShowAddBoardModal(true);
              setIsExpanded(false);
            }}
            className={`flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all `}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>New Board</span>
          </button>
          )
        }
        </>
      )}

      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
        aria-label={isExpanded ? "Close menu" : "Open create menu"}
      >
        <Plus className={`w-7 h-7 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
