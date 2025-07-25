import prisma from "../models/prismaClient"
import { ActionType } from "@prisma/client"
import * as diff from 'diff'

interface ActivityLogData {
  action: ActionType
  message: string
  projectId?: string
  boardId?: string
  taskId?: string
  diffData?: any // JSON object containing the diff data
}

interface TaskDiffData {
  title?: { old: string, new: string }
  description?: { old: string | null, new: string | null }
  status?: { old: string, new: string }
  priority?: { old: string, new: string }
  dueDate?: { old: Date | null, new: Date | null }
  assignedTo?: { old: string | null, new: string | null }
  boardId?: { old: string | null, new: string | null }
}

interface BoardDiffData {
  name?: { old: string, new: string }
  description?: { old: string | null, new: string | null }
  status?: { old: string, new: string }
}

interface ProjectDiffData {
  name?: { old: string, new: string }
  description?: { old: string | null, new: string | null }
}

class ActivityLogService {
  // Utility function to generate diff message
  private generateDiffMessage(changes: Record<string, { old: any, new: any }>): string {
    const changesList: string[] = []
    
    for (const [field, change] of Object.entries(changes)) {
      const oldValue = change.old ?? 'null'
      const newValue = change.new ?? 'null'
      
      if (field === 'dueDate') {
        const oldDate = change.old ? new Date(change.old).toLocaleDateString() : 'No due date'
        const newDate = change.new ? new Date(change.new).toLocaleDateString() : 'No due date'
        changesList.push(`${field}: ${oldDate} → ${newDate}`)
      } else if (field === 'assignedTo') {
        changesList.push(`${field}: ${oldValue || 'Unassigned'} → ${newValue || 'Unassigned'}`)
      } else if (typeof oldValue === 'string' && typeof newValue === 'string' && 
                 (oldValue.length > 50 || newValue.length > 50)) {
        // For long text fields, show a more compact diff
        const textDiff = diff.diffWords(oldValue, newValue)
        const diffSummary = textDiff
          .filter(part => part.added || part.removed)
          .map(part => part.added ? `+${part.value}` : `-${part.value}`)
          .join(' ')
        changesList.push(`${field}: ${diffSummary || 'text modified'}`)
      } else {
        changesList.push(`${field}: ${oldValue} → ${newValue}`)
      }
    }
    
    return changesList.join(', ')
  }

  // Utility function to create structured diff data
  private createDiffData(changes: Record<string, { old: any, new: any }>): any {
    const diffData: any = {
      changes: {},
      summary: {
        fieldsChanged: Object.keys(changes),
        changeCount: Object.keys(changes).length
      }
    }

    for (const [field, change] of Object.entries(changes)) {
      diffData.changes[field] = {
        oldValue: change.old,
        newValue: change.new,
        type: this.getChangeType(change.old, change.new)
      }

      // Add text diff for string fields that are long
      if (typeof change.old === 'string' && typeof change.new === 'string' && 
          (change.old.length > 20 || change.new.length > 20)) {
        const textDiff = diff.diffWords(change.old, change.new)
        diffData.changes[field].textDiff = textDiff.map(part => ({
          value: part.value,
          added: part.added || false,
          removed: part.removed || false
        }))
      }
    }

    return diffData
  }

  // Determine the type of change
  private getChangeType(oldValue: any, newValue: any): string {
    if (oldValue === null || oldValue === undefined) {
      return 'added'
    } else if (newValue === null || newValue === undefined) {
      return 'removed'
    } else {
      return 'modified'
    }
  }
  private detectChanges<T extends Record<string, any>>(oldObj: T, newObj: T, fields: (keyof T)[]): Record<string, { old: any, new: any }> {
    const changes: Record<string, { old: any, new: any }> = {}
    
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
    
    return this.logActivity(userId, {
      action: ActionType.TASK_UPDATED,
      message: `Updated task "${newTask.title}": ${diffMessage}`,
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
    
    return this.logActivity(userId, {
      action: ActionType.BOARD_UPDATED,
      message: `Updated board "${newBoard.name}": ${diffMessage}`,
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
    
    return this.logActivity(userId, {
      action: ActionType.PROJECT_UPDATED,
      message: `Updated project "${newProject.name}": ${diffMessage}`,
      projectId,
      diffData
    })
  }

  async logProjectMemberAdded(userId: string, projectId: string, projectName: string, memberName: string) {
    return this.logActivity(userId, {
      action: ActionType.PROJECT_MEMBER_ADDED,
      message: `Added ${memberName} to project "${projectName}"`,
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
    return this.logActivity(userId, {
      action: ActionType.TASK_UPDATED,
      message: `Changed status of task "${taskTitle}": ${oldStatus} → ${newStatus}`,
      projectId,
      boardId,
      taskId
    })
  }

  async logTaskAssignmentChange(userId: string, taskId: string, taskTitle: string, oldAssignee: string | null, newAssignee: string | null, projectId?: string, boardId?: string) {
    const oldName = oldAssignee || 'Unassigned'
    const newName = newAssignee || 'Unassigned'
    
    return this.logActivity(userId, {
      action: oldAssignee ? ActionType.TASK_UNASSIGNED : ActionType.TASK_ASSIGNED,
      message: `Changed assignment of task "${taskTitle}": ${oldName} → ${newName}`,
      projectId,
      boardId,
      taskId
    })
  }

  async logTaskMoved(userId: string, taskId: string, taskTitle: string, oldBoardName: string | null, newBoardName: string | null, projectId?: string) {
    const oldBoard = oldBoardName || 'No board'
    const newBoard = newBoardName || 'No board'
    
    return this.logActivity(userId, {
      action: ActionType.TASK_UPDATED,
      message: `Moved task "${taskTitle}": ${oldBoard} → ${newBoard}`,
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

    const changes = diffData.changes
    const changesList: string[] = []

    for (const [field, change] of Object.entries(changes)) {
      const changeData = change as { oldValue: any, newValue: any, type: string }
      
      if (field === 'dueDate') {
        const oldDate = changeData.oldValue ? new Date(changeData.oldValue).toLocaleDateString() : 'No due date'
        const newDate = changeData.newValue ? new Date(changeData.newValue).toLocaleDateString() : 'No due date'
        changesList.push(`${field}: ${oldDate} → ${newDate}`)
      } else {
        const oldValue = changeData.oldValue ?? 'null'
        const newValue = changeData.newValue ?? 'null'
        changesList.push(`${field}: ${oldValue} → ${newValue}`)
      }
    }

    return changesList.join(', ')
  }

  // Get detailed diff information for a specific activity log
  getDiffDetails(diffData: any) {
    if (!diffData) {
      return null
    }

    return {
      summary: diffData.summary || {},
      changes: diffData.changes || {},
      processed: diffData.processed || {},
      hasTextDiffs: Object.values(diffData.changes || {}).some((change: any) => change.textDiff),
      changeCount: diffData.summary?.changeCount || 0,
      fieldsChanged: diffData.summary?.fieldsChanged || []
    }
  }

  // Get text diff for a specific field (useful for rendering in UI)
  getTextDiffForField(diffData: any, fieldName: string) {
    if (!diffData?.changes?.[fieldName]?.textDiff) {
      return null
    }

    return diffData.changes[fieldName].textDiff
  }
}

export default new ActivityLogService()
