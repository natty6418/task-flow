"use client";

import { useState, useEffect } from "react";
import TasksList from "@/components/TaskList";
import BoardsList from "@/components/BoardsList";
import MembersList from "@/components/MembersList";
import NewTaskModal from "./NewTaskModal";

import { Project } from "@/types/type";
import { useDebounce } from "use-debounce";
import API from "@/services/api";
import toast from 'react-hot-toast';
import AddMemberModal from "@/components/AddMemberModal";
import AddBoardModal from "./AddBoardModal";
import FloatingActionButton from "./FloatingActionButton";


export default function ProjectDetails({ project }: { project: Project }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [members, setMembers] = useState(project.members);
  const [boards, setBoards] = useState(project.boards);
  const [tasks, setTasks] = useState(project.tasks);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);


  const [debouncedName] = useDebounce(name, 2000);
  const [debouncedDescription] = useDebounce(description, 2000);



  useEffect(() => {
    const updateProject = async () => {
      try {
        const response = await API.put(
          `/project/${project.id}`,
          {
            name: debouncedName,
            description: debouncedDescription,
          },
          { withCredentials: true }
        );
        if (response.status === 200) {
            // Update the local state with the new project data
            setName(debouncedName);
            setDescription(debouncedDescription);
          toast.success('Project updated successfully');
        }
      } catch (error) {
        toast.error('Failed to update project');
        console.error('Failed to update project:', error);
      }
    };

    if (
      debouncedName !== project.name ||
      debouncedDescription !== project.description
    ) {
      updateProject();
    }
  }, [debouncedName, debouncedDescription, project.id, project.name, project.description]);



  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Editable Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
        <h1 
  contentEditable 
  suppressContentEditableWarning 
  onBlur={(e) => setName(e.target.innerText)}
  className="text-3xl font-bold focus:outline-none"
>
  {name}
</h1>

<p 
  contentEditable 
  suppressContentEditableWarning 
  onBlur={(e) => setDescription(e.target.innerText)}
  className="text-gray-600 focus:outline-none"
>
  {description}
</p>

        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{project.members.length} members</span>
          <span>{project.tasks.length} tasks</span>
          <span>{project.boards.length} boards</span>
        </div>
      </div>

      {/* Horizontal Layout */}
      <div className="flex flex-col  gap-6 overflow-x-auto">
        <BoardsList boards={boards} tasks={tasks} projectId={project.id} setTasks={setTasks} setBoards={setBoards} setShowAddBoardModal={setShowAddBoardModal} />
        <TasksList tasks={tasks} setShowAddTaskModal={setShowTaskModal} setTasks={setTasks}/>
        <MembersList members={members} setShowAddMemberModal={setShowAddMemberModal}/>
      </div>

      {/* New Task Button */}
      <FloatingActionButton 
      setShowAddBoardModal={setShowAddBoardModal}
      setShowAddMemberModal={setShowAddMemberModal}
      setShowTaskModal={setShowTaskModal}
      />

      {/* New Task Modal */}
      {showTaskModal && (
        <NewTaskModal projectId={project.id} onClose={() => setShowTaskModal(false)} setTasks={setTasks} />
      )}
      {showAddMemberModal && (
        <AddMemberModal
          projectId={project.id}
          setMembers={setMembers}
          onClose={() => {setShowAddMemberModal(false)}}
        />
      )}
      {
        showAddBoardModal && (
          <AddBoardModal
            projectId={project.id}
            setBoards={setBoards}
            onClose={() => {setShowAddBoardModal(false)}}
          />
        )
      }
    </div>
  );
}
