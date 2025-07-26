import prisma from "../models/prismaClient"
import { ActionType } from "@prisma/client"
import * as diff from 'diff'
import { 
  DiffData, 
  FieldChange, 
  TextDiffPart, 
  TaskDiffChanges, 
  BoardDiffChanges, 
  ProjectDiffChanges,
  DiffDetails,
  ProcessedChanges,
  CreateDiffDataInput
} from '../types/activityLog'

interface ActivityLogData {
  action: ActionType
  message: string
  projectId?: string
  boardId?: string
  taskId?: string
  diffData?: DiffData
}

class ActivityLogService {
  // Utility function to generate diff message
  private generateDiffMessage(changes: Record<string, { old: any, new: any }>): string {
    const changesList: string[] = []
    
    for (const [field, change] of Object.entries(changes)) {
      const oldValue = change.old ?? null
      const newValue = change.new ?? null
      
      // Generate descriptive messages based on field type
      switch (field) {
        case 'title':
          if (oldValue && newValue) {
            changesList.push(`renamed from "${oldValue}" to "${newValue}"`)
          } else if (newValue) {
            changesList.push(`set title to "${newValue}"`)
          }
          break
          
        case 'description':
          if (oldValue && newValue) {
            if (oldValue.length > 50 || newValue.length > 50) {
              changesList.push('updated description')
            } else {
              changesList.push(`changed description from "${oldValue}" to "${newValue}"`)
            }
          } else if (newValue) {
            changesList.push('added description')
          } else if (oldValue) {
            changesList.push('removed description')
          }
          break
          
        case 'status':
          const statusMap: Record<string, string> = {
            'TODO': 'To Do',
            'IN_PROGRESS': 'In Progress', 
            'DONE': 'Done',
            'CANCELLED': 'Cancelled',
            'BLOCKED': 'Blocked'
          }
          const oldStatus = statusMap[oldValue] || oldValue
          const newStatus = statusMap[newValue] || newValue
          changesList.push(`changed status from ${oldStatus} to ${newStatus}`)
          break
          
        case 'priority':
          const priorityMap: Record<string, string> = {
            'LOW': 'Low',
            'MEDIUM': 'Medium',
            'HIGH': 'High',
            'URGENT': 'Urgent'
          }
          const oldPriority = priorityMap[oldValue] || oldValue
          const newPriority = priorityMap[newValue] || newValue
          changesList.push(`changed priority from ${oldPriority} to ${newPriority}`)
          break
          
        case 'dueDate':
          if (oldValue && newValue) {
            const oldDate = new Date(oldValue).toLocaleDateString()
            const newDate = new Date(newValue).toLocaleDateString()
            changesList.push(`changed due date from ${oldDate} to ${newDate}`)
          } else if (newValue) {
            const newDate = new Date(newValue).toLocaleDateString()
            changesList.push(`set due date to ${newDate}`)
          } else if (oldValue) {
            changesList.push('removed due date')
          }
          break
          
        case 'assignedTo':
          if (oldValue && newValue) {
            changesList.push(`reassigned from ${oldValue} to ${newValue}`)
          } else if (newValue) {
            changesList.push(`assigned to ${newValue}`)
          } else if (oldValue) {
            changesList.push(`unassigned from ${oldValue}`)
          }
          break
          
        case 'board':
          if (oldValue && newValue) {
            changesList.push(`moved from "${oldValue}" board to "${newValue}" board`)
          } else if (newValue) {
            changesList.push(`moved to "${newValue}" board`)
          } else if (oldValue) {
            changesList.push(`removed from "${oldValue}" board`)
          }
          break
          
        case 'name':
          if (oldValue && newValue) {
            changesList.push(`renamed from "${oldValue}" to "${newValue}"`)
          } else if (newValue) {
            changesList.push(`set name to "${newValue}"`)
          }
          break
          
        default:
          // Handle unknown fields with basic formatting
          if (typeof oldValue === 'string' && typeof newValue === 'string' && 
              (oldValue.length > 50 || newValue.length > 50)) {
            // For long text fields, show a more compact diff
            const textDiff = diff.diffWords(oldValue, newValue)
            const addedWords = textDiff.filter(part => part.added).length
            const removedWords = textDiff.filter(part => part.removed).length
            
            if (addedWords > 0 && removedWords > 0) {
              changesList.push(`modified ${field} (${addedWords} additions, ${removedWords} deletions)`)
            } else if (addedWords > 0) {
              changesList.push(`added content to ${field}`)
            } else if (removedWords > 0) {
              changesList.push(`removed content from ${field}`)
            } else {
              changesList.push(`updated ${field}`)
            }
          } else if (oldValue && newValue) {
            changesList.push(`changed ${field} from "${oldValue}" to "${newValue}"`)
          } else if (newValue) {
            changesList.push(`set ${field} to "${newValue}"`)
          } else if (oldValue) {
            changesList.push(`removed ${field}`)
          }
          break
      }
    }
    
    return changesList.join(', ')
  }

  // Utility function to create structured diff data
  private createDiffData(changes: CreateDiffDataInput): DiffData {
    const diffData: DiffData = {
      changes: {} as any,
      summary: {
        fieldsChanged: Object.keys(changes),
        changeCount: Object.keys(changes).length
      }
    }

    for (const [field, change] of Object.entries(changes)) {
      const fieldChange: FieldChange = {
        oldValue: change.old,
        newValue: change.new,
        type: this.getChangeType(change.old, change.new)
      }

      // Add text diff for string fields that are long
      if (typeof change.old === 'string' && typeof change.new === 'string' && 
          (change.old.length > 20 || change.new.length > 20)) {
        const textDiff = diff.diffWords(change.old, change.new)
        fieldChange.textDiff = textDiff.map(part => ({
          value: part.value,
          added: part.added || false,
          removed: part.removed || false
        }))
      }

      (diffData.changes as any)[field] = fieldChange
    }

    return diffData
  }

  // Determine the type of change
  private getChangeType(oldValue: any, newValue: any): 'added' | 'removed' | 'modified' {
    if (oldValue === null || oldValue === undefined) {
      return 'added'
    } else if (newValue === null || newValue === undefined) {
      return 'removed'
    } else {
      return 'modified'
    }
  }
  private detectChanges<T extends Record<string, any>>(oldObj: T, newObj: T, fields: (keyof T)[]): CreateDiffDataInput {
    const changes: CreateDiffDataInput = {}
    
    for (const field of fields) {
      const oldValue = oldObj[field]
      const newValue = newObj[field]
      
      // Handle different types of comparisons
      if (field === 'dueDate') {
        const oldDate = oldValue ? new Date(oldValue).getTime() : null
        const newDate = newValue ? new Date(newValue).getTime() : null
        if (oldDate !== newDate) {
          changes[field as string] = { old: oldValue, new: newValue }
        }
      } else if (oldValue !== newValue) {
        changes[field as string] = { old: oldValue, new: newValue }
      }
    }
    
    return changes
  }
  // Create activity log entry
  async logActivity(userId: string, data: ActivityLogData) {
    try {
      console.log(`[ActivityLogService] Logging activity: ${data.action} by user ${userId}`)
      console.log(`[ActivityLogService] Message: "${data.message}"`)
      if (data.diffData) {
        console.log(`[ActivityLogService] Diff data:`, JSON.stringify(data.diffData, null, 2))
      }
      
      const activityLog = await prisma.activityLog.create({
        data: {
          userId,
          action: data.action,
          message: data.message,
          projectId: data.projectId,
          boardId: data.boardId,
          taskId: data.taskId,
          diffData: data.diffData,
        }
      })

      console.log(`[ActivityLogService] Activity logged with ID: ${activityLog.id}`)
      return activityLog
    } catch (error) {
      console.error(`[ActivityLogService] Error logging activity:`, error)
      throw error
    }
  }

  // Get activity logs for a specific project
  async getProjectActivityLogs(projectId: string, limit: number = 50, offset: number = 0) {
    try {
      const logs = await prisma.activityLog.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          },
          board: {
            select: {
              id: true,
              name: true
            }
          },
          task: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      console.log(`[ActivityLogService] Retrieved ${logs.length} activity logs for project ${projectId}`)
      return logs
    } catch (error) {
      console.error(`[ActivityLogService] Error retrieving project activity logs:`, error)
      throw error
    }
  }

  // Get activity logs for a specific user
  async getUserActivityLogs(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const logs = await prisma.activityLog.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          },
          board: {
            select: {
              id: true,
              name: true
            }
          },
          task: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      console.log(`[ActivityLogService] Retrieved ${logs.length} activity logs for user ${userId}`)
      return logs
    } catch (error) {
      console.error(`[ActivityLogService] Error retrieving user activity logs:`, error)
      throw error
    }
  }

  // Get activity logs for a specific task
  async getTaskActivityLogs(taskId: string) {
    try {
      const logs = await prisma.activityLog.findMany({
        where: { taskId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          task: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log(`[ActivityLogService] Retrieved ${logs.length} activity logs for task ${taskId}`)
      return logs
    } catch (error) {
      console.error(`[ActivityLogService] Error retrieving task activity logs:`, error)
      throw error
    }
  }

  // Get activity logs for a specific board
  async getBoardActivityLogs(boardId: string) {
    try {
      const logs = await prisma.activityLog.findMany({
        where: { boardId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          board: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log(`[ActivityLogService] Retrieved ${logs.length} activity logs for board ${boardId}`)
      return logs
    } catch (error) {
      console.error(`[ActivityLogService] Error retrieving board activity logs:`, error)
      throw error
    }
  }

  // Helper methods for common activities

  // Task-related activities with diff support
  async logTaskCreated(userId: string, taskId: string, taskTitle: string, projectId?: string, boardId?: string) {
    return this.logActivity(userId, {
      action: ActionType.TASK_CREATED,
      message: `Created task "${taskTitle}"`,
      projectId,
      boardId,
      taskId
    })
  }

  async logTaskUpdated(userId: string, taskId: string, oldTask: any, newTask: any, projectId?: string, boardId?: string) {
    const taskFields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedToId', 'boardId']
    const changes = this.detectChanges(oldTask, newTask, taskFields)
    
    if (Object.keys(changes).length === 0) {
      // No actual changes detected
      return null
    }

    // Get user names for assignment changes
    const processedChanges = { ...changes }
    if (changes.assignedToId) {
      let oldAssignedName = null
      let newAssignedName = null
      
      if (changes.assignedToId.old) {
        const oldUser = await prisma.user.findUnique({
          where: { id: changes.assignedToId.old },
          select: { name: true }
        })
        oldAssignedName = oldUser?.name || 'Unknown User'
      }
      
      if (changes.assignedToId.new) {
        const newUser = await prisma.user.findUnique({
          where: { id: changes.assignedToId.new },
          select: { name: true }
        })
        newAssignedName = newUser?.name || 'Unknown User'
      }
      
      processedChanges.assignedTo = { old: oldAssignedName, new: newAssignedName }
      // Keep both assignedToId for the diff data and assignedTo for display
    }

    // Get board names for board changes
    if (changes.boardId) {
      let oldBoardName = null
      let newBoardName = null
      
      if (changes.boardId.old) {
        const oldBoard = await prisma.board.findUnique({
          where: { id: changes.boardId.old },
          select: { name: true }
        })
        oldBoardName = oldBoard?.name || 'Unknown Board'
      }
      
      if (changes.boardId.new) {
        const newBoard = await prisma.board.findUnique({
          where: { id: changes.boardId.new },
          select: { name: true }
        })
        newBoardName = newBoard?.name || 'Unknown Board'
      }
      
      processedChanges.board = { old: oldBoardName, new: newBoardName }
      // Keep both boardId for the diff data and board for display
    }

    // Create structured diff data for storage
    const diffData = this.createDiffData(changes)
    
    // Add processed names to diff data for better display
    if (processedChanges.assignedTo) {
      diffData.processed = diffData.processed || {}
      diffData.processed.assignedTo = processedChanges.assignedTo
    }
    if (processedChanges.board) {
      diffData.processed = diffData.processed || {}
      diffData.processed.board = processedChanges.board
    }

    // Generate human-readable message using processed changes
    const displayChanges = { ...processedChanges }
    delete displayChanges.assignedToId // Remove IDs from display message
    delete displayChanges.boardId
    
    const diffMessage = this.generateDiffMessage(displayChanges)
    
    // Create more specific action messages based on what changed
    let actionMessage = `Updated task "${newTask.title}"`
    const changeCount = Object.keys(changes).length
    
    if (changeCount === 1) {
      // Single change - be more specific
      const singleChange = Object.keys(changes)[0]
      switch (singleChange) {
        case 'status':
          actionMessage = `Changed status of task "${newTask.title}"`
          break
        case 'assignedToId':
          if (changes.assignedToId.old && changes.assignedToId.new) {
            actionMessage = `Reassigned task "${newTask.title}"`
          } else if (changes.assignedToId.new) {
            actionMessage = `Assigned task "${newTask.title}"`
          } else {
            actionMessage = `Unassigned task "${newTask.title}"`
          }
          break
        case 'priority':
          actionMessage = `Changed priority of task "${newTask.title}"`
          break
        case 'dueDate':
          if (changes.dueDate.old && changes.dueDate.new) {
            actionMessage = `Changed due date of task "${newTask.title}"`
          } else if (changes.dueDate.new) {
            actionMessage = `Set due date for task "${newTask.title}"`
          } else {
            actionMessage = `Removed due date from task "${newTask.title}"`
          }
          break
        case 'boardId':
          actionMessage = `Moved task "${newTask.title}"`
          break
        case 'title':
          actionMessage = `Renamed task`
          break
        case 'description':
          if (changes.description.old && changes.description.new) {
            actionMessage = `Updated description of task "${newTask.title}"`
          } else if (changes.description.new) {
            actionMessage = `Added description to task "${newTask.title}"`
          } else {
            actionMessage = `Removed description from task "${newTask.title}"`
          }
          break
        default:
          actionMessage = `Updated task "${newTask.title}"`
      }
    } else if (changeCount <= 3) {
      // Multiple changes but not too many - be descriptive
      const changeTypes = Object.keys(changes)
      if (changeTypes.includes('status') && changeTypes.includes('assignedToId')) {
        actionMessage = `Updated status and assignment of task "${newTask.title}"`
      } else if (changeTypes.includes('priority') && changeTypes.includes('dueDate')) {
        actionMessage = `Updated priority and due date of task "${newTask.title}"`
      } else {
        actionMessage = `Updated multiple fields of task "${newTask.title}"`
      }
    } else {
      // Many changes
      actionMessage = `Made ${changeCount} changes to task "${newTask.title}"`
    }
    
    return this.logActivity(userId, {
      action: ActionType.TASK_UPDATED,
      message: `${actionMessage}: ${diffMessage}`,
      projectId,
      boardId,
      taskId,
      diffData
    })
  }

  async logTaskDeleted(userId: string, taskTitle: string, projectId?: string, boardId?: string) {
    return this.logActivity(userId, {
      action: ActionType.TASK_DELETED,
      message: `Deleted task "${taskTitle}"`,
      projectId,
      boardId
    })
  }

  async logTaskAssigned(userId: string, taskId: string, taskTitle: string, assignedToName: string, projectId?: string, boardId?: string) {
    return this.logActivity(userId, {
      action: ActionType.TASK_ASSIGNED,
      message: `Assigned task "${taskTitle}" to ${assignedToName}`,
      projectId,
      boardId,
      taskId
    })
  }

  async logTaskUnassigned(userId: string, taskId: string, taskTitle: string, unassignedFromName: string, projectId?: string, boardId?: string) {
    return this.logActivity(userId, {
      action: ActionType.TASK_UNASSIGNED,
      message: `Unassigned task "${taskTitle}" from ${unassignedFromName}`,
      projectId,
      boardId,
      taskId
    })
  }

  async logTaskCompleted(userId: string, taskId: string, taskTitle: string, projectId?: string, boardId?: string) {
    return this.logActivity(userId, {
      action: ActionType.TASK_COMPLETED,
      message: `Completed task "${taskTitle}"`,
      projectId,
      boardId,
      taskId
    })
  }

  // Board-related activities with diff support
  async logBoardCreated(userId: string, boardId: string, boardName: string, projectId: string) {
    return this.logActivity(userId, {
      action: ActionType.BOARD_CREATED,
      message: `Created board "${boardName}"`,
      projectId,
      boardId
    })
  }

  async logBoardUpdated(userId: string, boardId: string, oldBoard: any, newBoard: any, projectId: string) {
    const boardFields = ['name', 'description', 'status']
    const changes = this.detectChanges(oldBoard, newBoard, boardFields)
    
    if (Object.keys(changes).length === 0) {
      return null
    }

    const diffData = this.createDiffData(changes)
    const diffMessage = this.generateDiffMessage(changes)
    
    // Create more specific message based on what changed
    let actionMessage = `Updated board "${newBoard.name}"`
    const changeCount = Object.keys(changes).length
    
    if (changeCount === 1) {
      const singleChange = Object.keys(changes)[0]
      switch (singleChange) {
        case 'name':
          actionMessage = `Renamed board from "${oldBoard.name}" to "${newBoard.name}"`
          break
        case 'description':
          if (changes.description.old && changes.description.new) {
            actionMessage = `Updated description of board "${newBoard.name}"`
          } else if (changes.description.new) {
            actionMessage = `Added description to board "${newBoard.name}"`
          } else {
            actionMessage = `Removed description from board "${newBoard.name}"`
          }
          break
        case 'status':
          actionMessage = `Changed status of board "${newBoard.name}"`
          break
        default:
          actionMessage = `Updated board "${newBoard.name}"`
      }
    }
    
    return this.logActivity(userId, {
      action: ActionType.BOARD_UPDATED,
      message: changeCount === 1 && Object.keys(changes)[0] === 'name' ? actionMessage : `${actionMessage}: ${diffMessage}`,
      projectId,
      boardId,
      diffData
    })
  }

  async logBoardDeleted(userId: string, boardName: string, projectId: string) {
    return this.logActivity(userId, {
      action: ActionType.BOARD_DELETED,
      message: `Deleted board "${boardName}"`,
      projectId
    })
  }

  // Project-related activities with diff support
  async logProjectCreated(userId: string, projectId: string, projectName: string) {
    return this.logActivity(userId, {
      action: ActionType.PROJECT_CREATED,
      message: `Created project "${projectName}"`,
      projectId
    })
  }

  async logProjectUpdated(userId: string, projectId: string, oldProject: any, newProject: any) {
    const projectFields = ['name', 'description']
    const changes = this.detectChanges(oldProject, newProject, projectFields)
    
    if (Object.keys(changes).length === 0) {
      return null
    }

    const diffData = this.createDiffData(changes)
    const diffMessage = this.generateDiffMessage(changes)
    
    // Create more specific message based on what changed
    let actionMessage = `Updated project "${newProject.name}"`
    const changeCount = Object.keys(changes).length
    
    if (changeCount === 1) {
      const singleChange = Object.keys(changes)[0]
      switch (singleChange) {
        case 'name':
          actionMessage = `Renamed project from "${oldProject.name}" to "${newProject.name}"`
          break
        case 'description':
          if (changes.description.old && changes.description.new) {
            actionMessage = `Updated description of project "${newProject.name}"`
          } else if (changes.description.new) {
            actionMessage = `Added description to project "${newProject.name}"`
          } else {
            actionMessage = `Removed description from project "${newProject.name}"`
          }
          break
        default:
          actionMessage = `Updated project "${newProject.name}"`
      }
    }
    
    return this.logActivity(userId, {
      action: ActionType.PROJECT_UPDATED,
      message: changeCount === 1 && Object.keys(changes)[0] === 'name' ? actionMessage : `${actionMessage}: ${diffMessage}`,
      projectId,
      diffData
    })
  }

  async logProjectMemberAdded(userId: string, projectId: string, projectName: string, memberName: string) {
    return this.logActivity(userId, {
      action: ActionType.PROJECT_MEMBER_ADDED,
      message: `Added ${memberName} as a member to project "${projectName}"`,
      projectId
    })
  }

  async logProjectMemberRemoved(userId: string, projectId: string, projectName: string, memberName: string) {
    return this.logActivity(userId, {
      action: ActionType.PROJECT_MEMBER_REMOVED,
      message: `Removed ${memberName} from project "${projectName}"`,
      projectId
    })
  }

  // Specific logging methods for common task changes
  async logTaskStatusChange(userId: string, taskId: string, taskTitle: string, oldStatus: string, newStatus: string, projectId?: string, boardId?: string) {
    const statusMap: Record<string, string> = {
      'TODO': 'To Do',
      'IN_PROGRESS': 'In Progress', 
      'DONE': 'Done',
      'CANCELLED': 'Cancelled',
      'BLOCKED': 'Blocked'
    }
    
    const oldStatusDisplay = statusMap[oldStatus] || oldStatus
    const newStatusDisplay = statusMap[newStatus] || newStatus
    
    return this.logActivity(userId, {
      action: ActionType.TASK_UPDATED,
      message: `Changed status of task "${taskTitle}" from ${oldStatusDisplay} to ${newStatusDisplay}`,
      projectId,
      boardId,
      taskId
    })
  }

  async logTaskAssignmentChange(userId: string, taskId: string, taskTitle: string, oldAssignee: string | null, newAssignee: string | null, projectId?: string, boardId?: string) {
    let message: string
    
    if (oldAssignee && newAssignee) {
      message = `Reassigned task "${taskTitle}" from ${oldAssignee} to ${newAssignee}`
    } else if (newAssignee) {
      message = `Assigned task "${taskTitle}" to ${newAssignee}`
    } else if (oldAssignee) {
      message = `Unassigned task "${taskTitle}" from ${oldAssignee}`
    } else {
      message = `Updated assignment for task "${taskTitle}"`
    }
    
    const action = oldAssignee ? ActionType.TASK_UNASSIGNED : ActionType.TASK_ASSIGNED
    
    return this.logActivity(userId, {
      action,
      message,
      projectId,
      boardId,
      taskId
    })
  }

  async logTaskMoved(userId: string, taskId: string, taskTitle: string, oldBoardName: string | null, newBoardName: string | null, projectId?: string) {
    let message: string
    
    if (oldBoardName && newBoardName) {
      message = `Moved task "${taskTitle}" from "${oldBoardName}" board to "${newBoardName}" board`
    } else if (newBoardName) {
      message = `Moved task "${taskTitle}" to "${newBoardName}" board`
    } else if (oldBoardName) {
      message = `Removed task "${taskTitle}" from "${oldBoardName}" board`
    } else {
      message = `Updated board assignment for task "${taskTitle}"`
    }
    
    return this.logActivity(userId, {
      action: ActionType.TASK_UPDATED,
      message,
      projectId,
      taskId
    })
  }

  // Get recent activity across all projects for a user (dashboard view)
  async getRecentActivityForUser(userId: string, limit: number = 20) {
    try {
      // Simply get all activity logs for the user - this includes both:
      // 1. Activities the user performed (userId field)
      // 2. All project/task activities they should see based on the relationship
      const logs = await prisma.activityLog.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          },
          board: {
            select: {
              id: true,
              name: true
            }
          },
          task: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      console.log(`[ActivityLogService] Retrieved ${logs.length} recent activity logs for user ${userId}`)
      return logs
    } catch (error) {
      console.error(`[ActivityLogService] Error retrieving recent activity for user:`, error)
      throw error
    }
  }

  // Utility methods for working with diff data
  
  // Generate a human-readable diff summary from stored diff data
  generateDiffSummary(diffData: any): string {
    if (!diffData || !diffData.changes) {
      return 'No changes recorded'
    }

    const changes = diffData.changes as Record<string, FieldChange>
    const changesList: string[] = []

    for (const [field, change] of Object.entries(changes)) {
      const oldValue = change.oldValue ?? null
      const newValue = change.newValue ?? null
      
      // Use the same descriptive logic as generateDiffMessage
      switch (field) {
        case 'title':
          if (oldValue && newValue) {
            changesList.push(`renamed from "${oldValue}" to "${newValue}"`)
          } else if (newValue) {
            changesList.push(`set title to "${newValue}"`)
          }
          break
          
        case 'description':
          if (oldValue && newValue) {
            if (String(oldValue).length > 50 || String(newValue).length > 50) {
              changesList.push('updated description')
            } else {
              changesList.push(`changed description from "${oldValue}" to "${newValue}"`)
            }
          } else if (newValue) {
            changesList.push('added description')
          } else if (oldValue) {
            changesList.push('removed description')
          }
          break
          
        case 'status':
          const statusMap: Record<string, string> = {
            'TODO': 'To Do',
            'IN_PROGRESS': 'In Progress', 
            'DONE': 'Done',
            'CANCELLED': 'Cancelled',
            'BLOCKED': 'Blocked'
          }
          const oldStatus = statusMap[oldValue] || oldValue
          const newStatus = statusMap[newValue] || newValue
          changesList.push(`changed status from ${oldStatus} to ${newStatus}`)
          break
          
        case 'priority':
          const priorityMap: Record<string, string> = {
            'LOW': 'Low',
            'MEDIUM': 'Medium',
            'HIGH': 'High',
            'URGENT': 'Urgent'
          }
          const oldPriority = priorityMap[oldValue] || oldValue
          const newPriority = priorityMap[newValue] || newValue
          changesList.push(`changed priority from ${oldPriority} to ${newPriority}`)
          break
          
        case 'dueDate':
          if (oldValue && newValue) {
            const oldDate = new Date(oldValue).toLocaleDateString()
            const newDate = new Date(newValue).toLocaleDateString()
            changesList.push(`changed due date from ${oldDate} to ${newDate}`)
          } else if (newValue) {
            const newDate = new Date(newValue).toLocaleDateString()
            changesList.push(`set due date to ${newDate}`)
          } else if (oldValue) {
            changesList.push('removed due date')
          }
          break
          
        case 'assignedToId':
          // Check if we have processed names available
          const processed = (diffData as any).processed
          if (processed?.assignedTo) {
            const oldAssignee = processed.assignedTo.old
            const newAssignee = processed.assignedTo.new
            
            if (oldAssignee && newAssignee) {
              changesList.push(`reassigned from ${oldAssignee} to ${newAssignee}`)
            } else if (newAssignee) {
              changesList.push(`assigned to ${newAssignee}`)
            } else if (oldAssignee) {
              changesList.push(`unassigned from ${oldAssignee}`)
            }
          } else {
            // Fallback to IDs if names not available
            if (oldValue && newValue) {
              changesList.push(`reassigned to different user`)
            } else if (newValue) {
              changesList.push(`assigned to user`)
            } else if (oldValue) {
              changesList.push(`unassigned`)
            }
          }
          break
          
        case 'boardId':
          // Check if we have processed names available
          const processedBoard = (diffData as any).processed
          if (processedBoard?.board) {
            const oldBoard = processedBoard.board.old
            const newBoard = processedBoard.board.new
            
            if (oldBoard && newBoard) {
              changesList.push(`moved from "${oldBoard}" board to "${newBoard}" board`)
            } else if (newBoard) {
              changesList.push(`moved to "${newBoard}" board`)
            } else if (oldBoard) {
              changesList.push(`removed from "${oldBoard}" board`)
            }
          } else {
            // Fallback to IDs if names not available
            if (oldValue && newValue) {
              changesList.push(`moved to different board`)
            } else if (newValue) {
              changesList.push(`moved to board`)
            } else if (oldValue) {
              changesList.push(`removed from board`)
            }
          }
          break
          
        case 'name':
          if (oldValue && newValue) {
            changesList.push(`renamed from "${oldValue}" to "${newValue}"`)
          } else if (newValue) {
            changesList.push(`set name to "${newValue}"`)
          }
          break
          
        default:
          // Handle unknown fields with basic formatting
          if (typeof oldValue === 'string' && typeof newValue === 'string' && 
              (oldValue.length > 50 || newValue.length > 50)) {
            changesList.push(`updated ${field}`)
          } else if (oldValue && newValue) {
            changesList.push(`changed ${field} from "${oldValue}" to "${newValue}"`)
          } else if (newValue) {
            changesList.push(`set ${field} to "${newValue}"`)
          } else if (oldValue) {
            changesList.push(`removed ${field}`)
          }
          break
      }
    }

    return changesList.join(', ')
  }

  // Get detailed diff information for a specific activity log
  getDiffDetails(diffData: any): DiffDetails | null {
    if (!diffData) {
      return null
    }

    const changes = diffData.changes as Record<string, FieldChange>
    return {
      summary: diffData.summary || { fieldsChanged: [], changeCount: 0 },
      changes: changes || {},
      processed: diffData.processed || {},
      hasTextDiffs: Object.values(changes || {}).some((change: FieldChange) => change.textDiff),
      changeCount: diffData.summary?.changeCount || 0,
      fieldsChanged: diffData.summary?.fieldsChanged || []
    }
  }

  // Get text diff for a specific field (useful for rendering in UI)
  getTextDiffForField(diffData: any, fieldName: string): TextDiffPart[] | null {
    const changes = diffData.changes as Record<string, FieldChange>
    if (!changes?.[fieldName]?.textDiff) {
      return null
    }

    return changes[fieldName].textDiff || null
  }
}

export default new ActivityLogService()
