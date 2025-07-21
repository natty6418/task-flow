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
    const projectMembers = await prisma.projectMember.findMany({
      where: { 
        projectId,
        ...(excludeUserId && { userId: { not: excludeUserId } })
      },
      select: { userId: true }
    })

    const notifications = projectMembers.map(member => ({
      userId: member.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      projectId: data.projectId,
      taskId: data.taskId,
      boardId: data.boardId,
    }))

    return await prisma.notification.createMany({
      data: notifications
    })
  }

  // Task-related notifications
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
}

export default new NotificationService()