// TypeScript types for Activity Log diff data structures

export interface TextDiffPart {
  value: string
  added: boolean
  removed: boolean
}

export interface FieldChange<T = any> {
  oldValue: T
  newValue: T
  type: 'added' | 'removed' | 'modified'
  textDiff?: TextDiffPart[]
}

export interface TaskDiffChanges {
  title?: FieldChange<string>
  description?: FieldChange<string | null>
  status?: FieldChange<string>
  priority?: FieldChange<string>
  dueDate?: FieldChange<Date | null>
  assignedToId?: FieldChange<string | null>
  boardId?: FieldChange<string | null>
}

export interface BoardDiffChanges {
  name?: FieldChange<string>
  description?: FieldChange<string | null>
  status?: FieldChange<string>
}

export interface ProjectDiffChanges {
  name?: FieldChange<string>
  description?: FieldChange<string | null>
}

export interface ProcessedChanges {
  assignedTo?: {
    old: string | null
    new: string | null
  }
  board?: {
    old: string | null
    new: string | null
  }
}

export interface DiffSummary {
  fieldsChanged: string[]
  changeCount: number
}

export interface DiffData<T = TaskDiffChanges | BoardDiffChanges | ProjectDiffChanges> {
  changes: T
  summary: DiffSummary
  processed?: ProcessedChanges
  [key: string]: any // Allow additional properties for Prisma JSON compatibility
}

export interface DiffDetails {
  summary: DiffSummary
  changes: Record<string, FieldChange>
  processed: ProcessedChanges
  hasTextDiffs: boolean
  changeCount: number
  fieldsChanged: string[]
}

export interface ActivityLogDiffResponse {
  logId: string
  action: string
  message: string
  createdAt: Date
  diffDetails: DiffDetails | null
  diffSummary: string
  textDiffs: Record<string, TextDiffPart[]>
}

export interface EnhancedActivityLog {
  id: string
  userId: string
  projectId?: string | null
  boardId?: string | null
  taskId?: string | null
  action: string
  message: string
  diffData?: DiffData | null
  createdAt: Date
  user?: {
    id: string
    name: string
    email: string
  }
  project?: {
    id: string
    name: string
  }
  board?: {
    id: string
    name: string
  }
  task?: {
    id: string
    title: string
  }
  diffDetails?: DiffDetails | null
  diffSummary?: string | null
}

// Type for the changes detection input
export interface ChangeDetectionInput {
  old: any
  new: any
}

// Utility type for creating diff data
export type CreateDiffDataInput = Record<string, ChangeDetectionInput>
