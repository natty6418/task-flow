# Activity Log Diff Data Types

This document describes the strong TypeScript types for the activity log diff data system in the Task Flow application.

## Overview

The diff data system tracks changes to entities (tasks, boards, projects) and stores structured information about what changed, including text-level diffs for long text fields.

## Core Types

### `TextDiffPart`
Represents a single part of a text diff showing what was added, removed, or unchanged.

```typescript
interface TextDiffPart {
  value: string        // The text content
  added: boolean       // True if this text was added
  removed: boolean     // True if this text was removed
}
```

### `FieldChange<T>`
Represents a change to a single field, including the old and new values and metadata.

```typescript
interface FieldChange<T = any> {
  oldValue: T                    // Previous value
  newValue: T                    // New value  
  type: 'added' | 'removed' | 'modified'  // Type of change
  textDiff?: TextDiffPart[]      // Optional word-level diff for text fields
}
```

### Change Types
- **`added`**: Field went from null/undefined to a value
- **`removed`**: Field went from a value to null/undefined  
- **`modified`**: Field changed from one value to another

### Entity-Specific Change Types

#### `TaskDiffChanges`
```typescript
interface TaskDiffChanges {
  title?: FieldChange<string>
  description?: FieldChange<string | null>
  status?: FieldChange<string>
  priority?: FieldChange<string>
  dueDate?: FieldChange<Date | null>
  assignedToId?: FieldChange<string | null>
  boardId?: FieldChange<string | null>
}
```

#### `BoardDiffChanges`
```typescript
interface BoardDiffChanges {
  name?: FieldChange<string>
  description?: FieldChange<string | null>
  status?: FieldChange<string>
}
```

#### `ProjectDiffChanges`
```typescript
interface ProjectDiffChanges {
  name?: FieldChange<string>
  description?: FieldChange<string | null>
}
```

### `ProcessedChanges`
Human-readable versions of reference fields (IDs converted to names).

```typescript
interface ProcessedChanges {
  assignedTo?: {
    old: string | null    // User name or null
    new: string | null    // User name or null
  }
  board?: {
    old: string | null    // Board name or null
    new: string | null    // Board name or null
  }
}
```

### `DiffData<T>`
Main container for all diff information stored in the database.

```typescript
interface DiffData<T = TaskDiffChanges | BoardDiffChanges | ProjectDiffChanges> {
  changes: T                    // The actual field changes
  summary: DiffSummary         // Metadata about the changes
  processed?: ProcessedChanges // Human-readable versions
  [key: string]: any          // Allow additional properties for Prisma JSON compatibility
}
```

### `DiffSummary`
Metadata about the changes for quick access.

```typescript
interface DiffSummary {
  fieldsChanged: string[]  // List of field names that changed
  changeCount: number      // Total number of changes
}
```

### `DiffDetails`
Enhanced diff information returned by the service layer.

```typescript
interface DiffDetails {
  summary: DiffSummary
  changes: Record<string, FieldChange>
  processed: ProcessedChanges
  hasTextDiffs: boolean        // True if any field has text diffs
  changeCount: number
  fieldsChanged: string[]
}
```

## API Response Types

### `ActivityLogDiffResponse`
Response format for the `/activity/diff/:logId` endpoint.

```typescript
interface ActivityLogDiffResponse {
  logId: string
  action: string
  message: string
  createdAt: Date
  diffDetails: DiffDetails | null
  diffSummary: string
  textDiffs: Record<string, TextDiffPart[]>  // Field name -> text diff parts
}
```

### `EnhancedActivityLog`
Activity log with additional diff information for list endpoints.

```typescript
interface EnhancedActivityLog {
  id: string
  userId: string
  projectId?: string | null
  boardId?: string | null
  taskId?: string | null
  action: string
  message: string
  diffData?: DiffData | null
  createdAt: Date
  user?: { id: string; name: string; email: string }
  project?: { id: string; name: string }
  board?: { id: string; name: string }
  task?: { id: string; title: string }
  diffDetails?: DiffDetails | null
  diffSummary?: string | null
}
```

## Example Usage

### Creating Diff Data (Service Layer)
```typescript
// In activityLogService.ts
const changes = this.detectChanges(oldTask, newTask, ['title', 'status', 'assignedToId'])
const diffData = this.createDiffData(changes)

await this.logActivity(userId, {
  action: 'TASK_UPDATED',
  message: 'Changed status of task "Fix login bug" from To Do to In Progress',
  taskId,
  projectId,
  diffData
})
```

### Consuming Diff Data (API Layer)
```typescript
// In routes/activity.ts
const enhancedLogs = enhanceLogs(logs)  // Adds diffDetails and diffSummary

// For detailed diff view
const diffDetails = activityLogService.getDiffDetails(log.diffData)
const textDiffs = {}
for (const fieldName of diffDetails.fieldsChanged) {
  const textDiff = activityLogService.getTextDiffForField(log.diffData, fieldName)
  if (textDiff) {
    textDiffs[fieldName] = textDiff
  }
}
```

## Descriptive Message Examples

The system now generates highly descriptive messages based on the type and context of changes:

### Task Messages
- **Single Status Change**: `"Changed status of task 'Fix login bug' from To Do to In Progress"`
- **Assignment**: `"Assigned task 'Review API documentation' to Jane Smith"`
- **Reassignment**: `"Reassigned task 'Update database schema' from John Doe to Jane Smith"`
- **Due Date**: `"Set due date for task 'Deploy to staging' to 7/30/2025"`
- **Priority Change**: `"Changed priority of task 'Security patch' from Medium to High"`
- **Board Move**: `"Moved task 'User authentication' from 'To Do' board to 'In Progress' board"`
- **Title Rename**: `"Renamed task from 'Bug fix' to 'Fix critical login authentication bug'"`
- **Description**: `"Added description to task 'API endpoints'"`
- **Multiple Changes**: `"Updated status and assignment of task 'Database migration': changed status from To Do to In Progress, assigned to Jane Smith"`

### Board Messages
- **Rename**: `"Renamed board from 'Backlog' to 'Product Backlog'"`
- **Description**: `"Updated description of board 'Sprint 1'"`

### Project Messages  
- **Rename**: `"Renamed project from 'Web App' to 'Customer Portal Web Application'"`
- **Member**: `"Added Jane Smith as a member to project 'E-commerce Platform'"`

## Example Diff Data Structure

```json
{
  "changes": {
    "title": {
      "oldValue": "Fix login bug",
      "newValue": "Fix critical login authentication bug",
      "type": "modified",
      "textDiff": [
        { "value": "Fix ", "added": false, "removed": false },
        { "value": "critical ", "added": true, "removed": false },
        { "value": "login ", "added": false, "removed": false },
        { "value": "authentication ", "added": true, "removed": false },
        { "value": "bug", "added": false, "removed": false }
      ]
    },
    "status": {
      "oldValue": "TODO",
      "newValue": "IN_PROGRESS",
      "type": "modified"
    },
    "assignedToId": {
      "oldValue": null,
      "newValue": "user-123-id",
      "type": "added"
    }
  },
  "summary": {
    "fieldsChanged": ["title", "status", "assignedToId"],
    "changeCount": 3
  },
  "processed": {
    "assignedTo": {
      "old": null,
      "new": "Jane Smith"
    }
  }
}
```

## Benefits

1. **Type Safety**: Full TypeScript support with compile-time error checking
2. **Extensibility**: Easy to add new entity types and change tracking
3. **Rich Diffs**: Word-level text diffs for detailed change visualization  
4. **Human Readable**: Processed versions of reference fields for better UX
5. **API Consistency**: Standardized response formats across all endpoints
6. **Database Compatibility**: Works seamlessly with Prisma's JSON field type
