import prisma from "../models/prismaClient"
import { NotificationType } from "@prisma/client"

interface NotificationData {
  type: NotificationType
  title: string
  message: string
  projectId?: string
  taskId?: string
  boardId?: string
}

class NotificationService {
  // Create notification for specific user
  async createNotification(userId: string, data: NotificationData) {
    return await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        projectId: data.projectId,
        taskId: data.taskId,
        boardId: data.boardId,
      }
    })
  }

  // Create notifications for all project members
  async notifyProjectMembers(projectId: string, data: NotificationData, excludeUserId?: string) {
    console.log(`[NotificationService] Starting notification for project: ${projectId}`)
    console.log(`[NotificationService] Notification type: ${data.type}, title: "${data.title}"`)
    console.log(`[NotificationService] NOT excluding anyone - all members will be notified`)
    
    const projectMembers = await prisma.projectMember.findMany({
      where: { 
        projectId
      },
      select: { userId: true }
    })

    console.log(`[NotificationService] Found ${projectMembers.length} project members to notify`)
    console.log(`[NotificationService] Member IDs: ${projectMembers.map(m => m.userId).join(', ')}`)

    if (projectMembers.length === 0) {
      console.log(`[NotificationService] No members to notify for project ${projectId}`)
      return
    }

    const notifications = projectMembers.map(member => ({
      userId: member.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      projectId: data.projectId,
      taskId: data.taskId,
      boardId: data.boardId,
    }))

    console.log(`[NotificationService] Creating ${notifications.length} notifications`)
    console.log(`[NotificationService] All Member IDs: ${notifications.map(n => n.userId).join(', ')}`)

    if (notifications.length === 0) {
      console.log(`[NotificationService] No notifications to create for project ${projectId}`)
      return
    }

    try {
      const result = await prisma.notification.createMany({
        data: notifications
      })
      console.log(`[NotificationService] Successfully created ${result.count} notifications`)
      return result
    } catch (error) {
      console.error(`[NotificationService] Error creating notifications:`, error)
      throw error
    }
  }

  // Task-related notifications
  async notifyTaskCreated(taskId: string, createdByUserId: string, projectId?: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        project: { select: { name: true } },
        assignedTo: { select: { name: true } },
        board: { select: { name: true } }
      }
    })

    if (!task) return

    // If task is assigned to someone other than creator, notify them
    if (task.assignedToId && task.assignedToId !== createdByUserId) {
      await this.createNotification(task.assignedToId, {
        type: "TASK_ASSIGNED",
        title: "Task Created and Assigned",
        message: `You have been assigned to new task: ${task.title}`,
        projectId: task.projectId || undefined,
        taskId: task.id,
        boardId: task.boardId || undefined,
      })
    }

    // Notify project members about new task
    if (task.projectId) {
      const message = task.boardId 
        ? `New task "${task.title}" was created in board "${task.board?.name}"`
        : `New task "${task.title}" was created`
      
      await this.notifyProjectMembers(task.projectId, {
        type: "TASK_CREATED",
        title: "New Task Created",
        message,
        projectId: task.projectId,
        taskId: task.id,
        boardId: task.boardId || undefined,
      }, createdByUserId)
    }
  }

  async notifyTaskAssigned(taskId: string, assignedUserId: string, assignedByUserId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        project: { select: { name: true } },
        assignedTo: { select: { name: true } }
      }
    })

    if (!task || !task.assignedTo) return

    await this.createNotification(assignedUserId, {
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: `You have been assigned to task: ${task.title}`,
      projectId: task.projectId || undefined,
      taskId: task.id,
    })

    // Notify other project members
    if (task.projectId) {
      await this.notifyProjectMembers(task.projectId, {
        type: "TASK_ASSIGNED",
        title: "Task Assignment Update",
        message: `${task.assignedTo.name} was assigned to task: ${task.title}`,
        projectId: task.projectId,
        taskId: task.id,
      }, assignedUserId) // Exclude the assigned user
    }
  }

  async notifyTaskUnassigned(taskId: string, previousAssigneeId: string, unassignedByUserId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { name: true } } }
    })

    if (!task) return

    await this.createNotification(previousAssigneeId, {
      type: "TASK_UNASSIGNED",
      title: "Task Unassigned",
      message: `You have been unassigned from task: ${task.title}`,
      projectId: task.projectId || undefined,
      taskId: task.id,
    })
  }

  async notifyTaskUpdated(taskId: string, updatedByUserId: string, changes: string[]) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        project: { select: { name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    })

    if (!task) return

    const changeText = changes.join(", ")
    
    // Notify assigned user if different from updater
    if (task.assignedTo && task.assignedTo.id !== updatedByUserId) {
      await this.createNotification(task.assignedTo.id, {
        type: "TASK_UPDATED",
        title: "Task Updated",
        message: `Your assigned task "${task.title}" was updated: ${changeText}`,
        projectId: task.projectId || undefined,
        taskId: task.id,
      })
    }

    // Notify project members
    if (task.projectId) {
      await this.notifyProjectMembers(task.projectId, {
        type: "TASK_UPDATED",
        title: "Task Updated",
        message: `Task "${task.title}" was updated: ${changeText}`,
        projectId: task.projectId,
        taskId: task.id,
      }, updatedByUserId)
    }
  }

  // Board-related notifications
  async notifyBoardCreated(boardId: string, createdByUserId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { project: { select: { name: true } } }
    })

    if (!board) return

    await this.notifyProjectMembers(board.projectId, {
      type: "BOARD_CREATED",
      title: "New Board Created",
      message: `New board "${board.name}" was created in project ${board.project.name}`,
      projectId: board.projectId,
      boardId: board.id,
    }, createdByUserId)
  }

  async notifyBoardUpdated(boardId: string, updatedByUserId: string, newName?: string, newDescription?: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { project: { select: { name: true } } }
    })

    if (!board) return

    const changes: string[] = []
    if (newName && newName !== board.name) changes.push(`name updated to "${newName}"`)
    if (newDescription !== undefined && newDescription !== board.description) {
      changes.push(`description ${newDescription ? `updated to "${newDescription}"` : 'removed'}`)
    }

    if (changes.length === 0) return // No meaningful changes to notify about

    await this.notifyProjectMembers(board.projectId, {
      type: "BOARD_UPDATED",
      title: "Board Updated",
      message: `Board "${board.name}" was updated: ${changes.join(", ")}`,
      projectId: board.projectId,
      boardId: board.id,
    }, updatedByUserId)
  }

  async notifyBoardDeleted(boardId: string, boardName: string, projectId: string, deletedByUserId: string) {
    await this.notifyProjectMembers(projectId, {
      type: "BOARD_DELETED",
      title: "Board Deleted",
      message: `Board "${boardName}" was deleted`,
      projectId: projectId,
    }, deletedByUserId)
  }

  async notifyTaskMovedToBoard(taskId: string, boardId: string, movedByUserId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        project: { select: { name: true } },
        board: { select: { name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    })

    if (!task || !task.board) return

    // Notify the assigned user if different from the one who moved it
    if (task.assignedTo && task.assignedTo.id !== movedByUserId) {
      await this.createNotification(task.assignedTo.id, {
        type: "TASK_UPDATED",
        title: "Task Moved",
        message: `Your task "${task.title}" was moved to board "${task.board.name}"`,
        projectId: task.projectId || undefined,
        taskId: task.id,
        boardId: task.boardId || undefined,
      })
    }

    // Notify project members
    if (task.projectId) {
      await this.notifyProjectMembers(task.projectId, {
        type: "TASK_UPDATED",
        title: "Task Moved",
        message: `Task "${task.title}" was moved to board "${task.board.name}"`,
        projectId: task.projectId,
        taskId: task.id,
        boardId: task.boardId || undefined,
      }, movedByUserId)
    }
  }

  async notifyTaskRemovedFromBoard(taskId: string, taskTitle: string, boardName: string, projectId: string, removedByUserId: string) {
    await this.notifyProjectMembers(projectId, {
      type: "TASK_UPDATED",
      title: "Task Removed from Board",
      message: `Task "${taskTitle}" was removed from board "${boardName}"`,
      projectId: projectId,
      taskId: taskId,
    }, removedByUserId)
  }

  async notifyTaskDeleted(taskTitle: string, projectId?: string, assignedUserId?: string, deletedByUserId?: string) {
    // Notify assigned user if they exist and are different from deleter
    if (assignedUserId && assignedUserId !== deletedByUserId) {
      await this.createNotification(assignedUserId, {
        type: "TASK_DELETED",
        title: "Task Deleted",
        message: `Your assigned task "${taskTitle}" was deleted`,
        projectId: projectId,
      })
    }

    // Notify project members
    if (projectId) {
      await this.notifyProjectMembers(projectId, {
        type: "TASK_DELETED",
        title: "Task Deleted",
        message: `Task "${taskTitle}" was deleted`,
        projectId: projectId,
      }, deletedByUserId)
    }
  }

  async notifyTaskCompleted(taskId: string, completedByUserId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        project: { select: { name: true } },
        assignedTo: { select: { id: true, name: true } },
        board: { select: { name: true } }
      }
    })

    if (!task) return

    // Notify project members about task completion
    if (task.projectId) {
      const completedBy = task.assignedTo?.id === completedByUserId ? "by assignee" : "by project member"
      const message = `Task "${task.title}" was completed ${completedBy}`
      
      await this.notifyProjectMembers(task.projectId, {
        type: "TASK_COMPLETED",
        title: "Task Completed",
        message,
        projectId: task.projectId,
        taskId: task.id,
        boardId: task.boardId || undefined,
      }, completedByUserId)
    }
  }
}

export default new NotificationService()