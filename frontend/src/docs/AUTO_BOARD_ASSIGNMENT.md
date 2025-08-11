# Automatic Task-to-Board Assignment

This document explains the automatic task-to-board assignment functionality that has been implemented in the TaskFlow application.

## Overview

When a task is created or its status changes, it will automatically be moved to the appropriate board based on the task's status. This ensures that tasks are always organized correctly within the project's board structure.

## Default Boards

The system uses three default boards that correspond to task statuses:

```typescript
const defaultBoards = [
  { name: "To Do", status: "TODO" as Status },
  { name: "In Progress", status: "IN_PROGRESS" as Status },
  { name: "Done", status: "DONE" as Status }
];
```

## How It Works

### 1. Task Creation

When a new task is created, the system:
1. Checks if the task has a `projectId` and no existing `boardId`
2. Looks for a board that matches the task's status
3. If no board exists for that status, creates the default board
4. Assigns the task to the appropriate board

### 2. Task Status Updates

When a task's status is changed:
1. The system identifies the target board for the new status
2. Updates the task's `boardId` to match the target board
3. The task is automatically moved to the correct board

### 3. Board Creation

If a board doesn't exist for a particular status, the system will automatically create default boards as needed:
- **To Do** board for `TODO` status
- **In Progress** board for `IN_PROGRESS` status  
- **Done** board for `DONE` status

## Implementation Details

### Services Updated

#### `taskService.ts`
- `createTask()`: Automatically assigns new tasks to appropriate boards
- `updateTask()`: Moves tasks to correct boards when status changes
- `moveTaskToBoard()`: Direct function to move tasks between boards

#### `projectService.ts`
- `addTaskToProject()`: Ensures project tasks are assigned to correct boards

#### `boardUtils.ts`
- `ensureBoardForStatus()`: Creates default boards if they don't exist
- `handleTaskStatusChange()`: Handles UI updates when tasks move between boards
- `getTargetBoardIdForStatus()`: Finds the correct board for a given status

### Components Updated

The following components already use the updated services and will automatically benefit from the new functionality:

- `ProjectDetails.tsx`: Task creation and status updates
- `UnifiedTaskPanel.tsx`: Dashboard task management
- `NewTaskModal.tsx`: New task creation
- `KanbanBoard.tsx`: Board-based task management

## Usage Examples

### Creating a Task

```typescript
import { createTask } from '@/services/taskSevice';
import { Status, Priority } from '@/types/type';

const newTask = {
  title: 'My New Task',
  description: 'Task description',
  status: Status.TODO,
  priority: Priority.MEDIUM,
  projectId: 'project-123',
  // boardId will be automatically assigned
};

const createdTask = await createTask(newTask);
// createdTask.boardId will be set to the TODO board's ID
```

### Updating Task Status

```typescript
import { updateTask } from '@/services/taskSevice';

const updatedTask = await updateTask({
  ...existingTask,
  status: Status.IN_PROGRESS,
  // boardId will be automatically updated to IN_PROGRESS board
});
```

### Direct Board Movement

```typescript
import { moveTaskToBoard } from '@/services/taskSevice';

const movedTask = await moveTaskToBoard(
  'task-123',
  Status.DONE,
  'project-123'
);
```

## Benefits

1. **Automatic Organization**: Tasks are always in the correct board
2. **Consistency**: No manual board assignment required
3. **Default Board Creation**: Boards are created automatically when needed
4. **Status Synchronization**: Task status and board location stay in sync
5. **Simplified UI**: Components don't need to handle board assignment logic

## Error Handling

The system includes robust error handling:
- If board creation fails, tasks will still be created/updated without board assignment
- Board fetching errors are logged but don't prevent task operations
- Missing boards trigger automatic creation of default boards

## Testing

Use the test utilities in `utils/testBoardAssignment.ts` to verify the functionality:

```typescript
import { testTaskBoardAssignment, testProjectTaskCreation } from '@/utils/testBoardAssignment';

// Test automatic board assignment
await testTaskBoardAssignment('your-project-id');

// Test project task creation
await testProjectTaskCreation('your-project-id');
```

## Migration

Existing tasks without board assignments will be automatically assigned to appropriate boards when they are next updated. No manual migration is required.
