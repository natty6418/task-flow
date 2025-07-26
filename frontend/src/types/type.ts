export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  authProvider: AuthProvider;
  projects: Project[];
  ownedProjects: Project[];
  assignedTasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  projectMemberships: ProjectMember[];
};

  export type ProjectMember = {
    id: string;
    role: Role;
    userId: string;
    projectId: string;
    user: User;
    project: Project;
  };
  
  export type Project = {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    owner: User;
    members: User[];
    tasks: Task[];
    boards: Board[];
    createdAt: Date;
    updatedAt: Date;
    projectMemberships: ProjectMember[];
  };
  export type Board = {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    status: Status;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
    project?: Project;
  };
  
  export type Task = {
    id: string;
    projectId?: string;
    assignedToId?: string;
    title: string;
    description?: string;
    status: Status;
    dueDate?: Date;
    priority: Priority;
    project?: Project;
    assignedTo?: User;
    createdAt: Date;
    updatedAt: Date;
    boardId?: string;
    board?: Board;
    
  };

  export interface Notification {
  id: string;
  userId: string;
  projectId?: string | null;
  taskId?: string | null;
  boardId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date; 
}

export interface ActivityLog {
  id: string;
  userId: string;
  projectId?: string;
  boardId?: string;
  taskId?: string;
  action: ActionType;
  message: string;
  createdAt: Date; // or Date if you’re not using JSON APIs
  diffData?: DiffData; // Optional field for detailed changes

  // Optional related data
  user?: User;
  task?: Task;
  board?: Board;
  project?: Project;
    
}



export enum ActionType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_UNASSIGNED = "TASK_UNASSIGNED",
  TASK_COMPLETED = "TASK_COMPLETED",

  BOARD_CREATED = "BOARD_CREATED",
  BOARD_UPDATED = "BOARD_UPDATED",
  BOARD_DELETED = "BOARD_DELETED",

  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_MEMBER_ADDED = "PROJECT_MEMBER_ADDED",
  PROJECT_MEMBER_REMOVED = "PROJECT_MEMBER_REMOVED",

  COMMENT_ADDED = "COMMENT_ADDED"
}



export enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UNASSIGNED = 'TASK_UNASSIGNED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  BOARD_CREATED = 'BOARD_CREATED',
  BOARD_UPDATED = 'BOARD_UPDATED',
  BOARD_DELETED = 'BOARD_DELETED',

  PROJECT_MEMBER_ADDED = 'PROJECT_MEMBER_ADDED',
  PROJECT_MEMBER_REMOVED = 'PROJECT_MEMBER_REMOVED',
}


  
  // Enums
  export enum Role {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    VIEWER = "VIEWER"
  }
  
  export enum Status {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
  }
  
  export enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
  }
  
  export enum AuthProvider {
    CREDENTIALS = "CREDENTIALS",
    GOOGLE = "GOOGLE",
    GITHUB = "GITHUB"
  }
    
  export type TasksByBoard = {
    [boardId: string]: Task[];
  };




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