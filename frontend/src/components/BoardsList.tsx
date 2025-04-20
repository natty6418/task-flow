"use client";
import { useState } from "react";
import { Board, Status, Task } from "@/types/type";
import { Layout, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Project } from "@/types/type";
import API from "@/services/api";
import BoardItem from "./BoardItem";
// import KanbanBoard from "./KanbanBoard";



export default function BoardsList({
  boards,
  tasks,
  setShowAddBoardModal,
  setTasks,
  setBoards,
  projectId,
}: {
  boards: Board[];
  tasks: Task[];
  setShowAddBoardModal: (showAddBoardModal: boolean) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId: string;
}) {
  const [expandedBoardId, setExpandedBoardId] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchBoards = async () => {
  //     try {
  //       const response = await API.get(`/board/all?projectId=${projectId}`);
  //       if (response.status === 200) {
  //         setBoards(response.data);
  //         setLoading(false);
  //         return;
  //       }
  //       console.error("Error fetching boards:", response.data);
  //     } catch (error) {
  //       console.error("Error fetching boards:", error);
  //     }
  //   };

  //   fetchBoards();
  // }, [projectId, setBoards]);

  const addBoard = async (newBoard: Board) => {
    try {
      const response = await API.post("/board/create", {
        ...newBoard,
        projectId,
      });
      if (response.status === 200) {
        setBoards((prevBoards) => [...prevBoards, response.data]);
      }
    } catch (error) {
      console.error("Error adding board:", error);
    }
  }



  const handleAddBoard = () => {
    const newBoard: Board = {
      id: uuidv4(), // temporary ID until saved to backend
      projectId: projectId, // you might need to pass projectId as a prop
      name: "New Board",
      description: "",
      status: Status.TODO,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      project: {} as Project, // You can leave this empty for now
    };

    setBoards((prevBoards) => [...prevBoards, newBoard]);
    addBoard(newBoard); // Save the new board to the backend
  };



  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Boards</h2>
        </div>
        <button
          onClick={() => handleAddBoard()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      {<div>

      {boards?.length > 0 ? (
        <ul className="space-y-3">
          {boards.map((board) => {
            const isExpanded = expandedBoardId === board.id;
            return (
              <li
                key={board.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <BoardItem
                  board={board}
                  isExpanded={isExpanded}
                  setExpandedBoardId={setExpandedBoardId}
                  setTasks={setTasks}
                  setBoards={setBoards}
                  projectId={projectId}
                  tasks={tasks}
                />
                
              </li>
            );
          })}
          
        </ul>
        
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No boards yet</p>
          <button
            onClick={() => setShowAddBoardModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create your first board
          </button>
        </div>
      )}
      </div>
}

    </div>
  );
}
