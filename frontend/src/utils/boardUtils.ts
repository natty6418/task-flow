import { Board, Status, Task } from "@/types/type";
import { createBoard } from "@/services/boardService";

export const DEFAULT_BOARDS = [
  { name: "To Do", status: Status.TODO },
  { name: "In Progress", status: Status.IN_PROGRESS },
  { name: "Done", status: Status.DONE }
];

/**
 * Ensures that default boards exist for a project
 * Creates missing default boards and returns the updated boards array
 */
export const ensureDefaultBoards = async (
  projectId: string,
  currentBoards: Board[],
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>
): Promise<Board[]> => {
  const existingBoardStatuses = currentBoards.map(board => board.status);
  const missingBoards = DEFAULT_BOARDS.filter(
    defaultBoard => !existingBoardStatuses.includes(defaultBoard.status)
  );

  if (missingBoards.length === 0) {
    return currentBoards;
  }

  // Create missing boards
  const newBoards: Board[] = [];
  for (const missingBoard of missingBoards) {
    try {
      const board = await createBoard({
        name: missingBoard.name,
        projectId,
        status: missingBoard.status,
        description: `Default ${missingBoard.name} board`
      });
      newBoards.push(board);
    } catch (error) {
      console.error(`Failed to create default board ${missingBoard.name}:`, error);
    }
  }

  const updatedBoards = [...currentBoards, ...newBoards];
  setBoards(updatedBoards);
  return updatedBoards;
};

/**
 * Finds the appropriate board for a task based on its status
 */
export const findBoardByStatus = (boards: Board[], status: Status): Board | undefined => {
  return boards.find(board => board.status === status);
};

/**
 * Moves a task to the appropriate board based on its status
 * Returns the board ID if found, undefined otherwise
 */
export const getTargetBoardIdForStatus = (boards: Board[], status: Status): string | undefined => {
  const targetBoard = findBoardByStatus(boards, status);
  return targetBoard?.id;
};

/**
 * Updates task assignment to boards when task status changes
 */
export const handleTaskStatusChange = (
  taskId: string,
  newStatus: Status,
  boards: Board[],
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
): string | undefined => {
  const targetBoardId = getTargetBoardIdForStatus(boards, newStatus);
  
  if (targetBoardId) {
    // Update the task with the new board assignment
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId 
          ? { ...task, status: newStatus, boardId: targetBoardId }
          : task
      )
    );
  }
  
  return targetBoardId;
};

/**
 * Ensures default boards exist for a project and returns the appropriate board ID for a task status
 * This is useful for task creation/update operations
 */
export const ensureBoardForStatus = async (
  projectId: string,
  status: Status,
  currentBoards?: Board[]
): Promise<string | undefined> => {
  try {
    // If we don't have current boards, fetch them
    let boards = currentBoards;
    if (!boards) {
      const { fetchBoardsByProject } = await import("@/services/boardService");
      boards = await fetchBoardsByProject(projectId);
    }

    // Check if the board for this status exists
    let targetBoardId = getTargetBoardIdForStatus(boards, status);
    
    // If no board exists for this status, create default boards
    if (!targetBoardId) {
      const missingBoard = DEFAULT_BOARDS.find(board => board.status === status);
      if (missingBoard) {
        const { createBoard } = await import("@/services/boardService");
        const newBoard = await createBoard({
          name: missingBoard.name,
          projectId,
          status: missingBoard.status,
          description: `Default ${missingBoard.name} board`
        });
        targetBoardId = newBoard.id;
      }
    }
    
    return targetBoardId;
  } catch (error) {
    console.error(`Failed to ensure board for status ${status}:`, error);
    return undefined;
  }
};
