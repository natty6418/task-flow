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
    project: Project;
  };
  
  export type Task = {
    id: string;
    projectId: string;
    assignedToId?: string;
    title: string;
    description?: string;
    status: Status;
    dueDate?: Date;
    priority: Priority;
    project: Project;
    assignedTo?: User;
    createdAt: Date;
    updatedAt: Date;
    boardId?: string;
    board?: Board;
  };
  
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
    
  