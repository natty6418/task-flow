import express, { Request, Response } from 'express'
import prisma from '../models/prismaClient'
import passport from 'passport'
import { User } from '@prisma/client'
import activityLogService from '../services/activityLogService'

const router = express.Router()

// Get activity logs for a specific project
router.get('/project/:projectId',
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    try {
      const { projectId } = req.params
      const { limit = 50, offset = 0 } = req.query

      // Check if user has access to this project
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: user.id
        }
      })

      const isOwner = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: user.id
        }
      })

      if (!projectMember && !isOwner) {
        res.status(403).json({ error: 'Access denied to this project' })
        return
      }

      const logs = await activityLogService.getProjectActivityLogs(
        projectId, 
        Number(limit), 
        Number(offset)
      )

      // Enhance logs with diff details
      const enhancedLogs = logs.map(log => ({
        ...log,
        diffDetails: log.diffData ? activityLogService.getDiffDetails(log.diffData) : null,
        diffSummary: log.diffData ? activityLogService.generateDiffSummary(log.diffData) : null
      }))

      res.json({
        logs: enhancedLogs,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          hasMore: logs.length === Number(limit)
        }
      })
    } catch (error) {
      console.error('Error fetching project activity logs:', error)
      res.status(500).json({ error: 'Failed to fetch activity logs' })
    }
  }
)

// Get activity logs for a specific task
router.get('/task/:taskId',
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    try {
      const { taskId } = req.params

      // Check if user has access to this task's project
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: {
            include: {
              projectMemberships: {
                where: { userId: user.id }
              }
            }
          }
        }
      })

      if (!task) {
        res.status(404).json({ error: 'Task not found' })
        return
      }

      const hasAccess = task.project && (
        task.project.ownerId === user.id || 
        task.project.projectMemberships.length > 0 ||
        task.assignedToId === user.id
      )

      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied to this task' })
        return
      }

      const logs = await activityLogService.getTaskActivityLogs(taskId)

      // Enhance logs with diff details
      const enhancedLogs = logs.map(log => ({
        ...log,
        diffDetails: log.diffData ? activityLogService.getDiffDetails(log.diffData) : null,
        diffSummary: log.diffData ? activityLogService.generateDiffSummary(log.diffData) : null
      }))

      res.json({ logs: enhancedLogs })
    } catch (error) {
      console.error('Error fetching task activity logs:', error)
      res.status(500).json({ error: 'Failed to fetch task activity logs' })
    }
  }
)

// Get activity logs for a specific board
router.get('/board/:boardId',
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    try {
      const { boardId } = req.params

      // Check if user has access to this board's project
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          project: {
            include: {
              projectMemberships: {
                where: { userId: user.id }
              }
            }
          }
        }
      })

      if (!board) {
        res.status(404).json({ error: 'Board not found' })
        return
      }

      const hasAccess = board.project.ownerId === user.id || board.project.projectMemberships.length > 0

      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied to this board' })
        return
      }

      const logs = await activityLogService.getBoardActivityLogs(boardId)

      // Enhance logs with diff details
      const enhancedLogs = logs.map(log => ({
        ...log,
        diffDetails: log.diffData ? activityLogService.getDiffDetails(log.diffData) : null,
        diffSummary: log.diffData ? activityLogService.generateDiffSummary(log.diffData) : null
      }))

      res.json({ logs: enhancedLogs })
    } catch (error) {
      console.error('Error fetching board activity logs:', error)
      res.status(500).json({ error: 'Failed to fetch board activity logs' })
    }
  }
)

// Get user's activity logs (their own actions)
router.get('/user/:userId',
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    try {
      const { userId: targetUserId } = req.params
      const { limit = 50, offset = 0 } = req.query

      // Users can only view their own activity logs
      if (user.id !== targetUserId) {
        res.status(403).json({ error: 'Access denied' })
        return
      }

      const logs = await activityLogService.getUserActivityLogs(
        targetUserId, 
        Number(limit), 
        Number(offset)
      )

      // Enhance logs with diff details
      const enhancedLogs = logs.map(log => ({
        ...log,
        diffDetails: log.diffData ? activityLogService.getDiffDetails(log.diffData) : null,
        diffSummary: log.diffData ? activityLogService.generateDiffSummary(log.diffData) : null
      }))

      res.json({
        logs: enhancedLogs,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          hasMore: logs.length === Number(limit)
        }
      })
    } catch (error) {
      console.error('Error fetching user activity logs:', error)
      res.status(500).json({ error: 'Failed to fetch user activity logs' })
    }
  }
)

// Get recent activity across all user's projects (dashboard view)
router.get('/recent',
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    try {
      const { limit = 20 } = req.query
    
      const logs = await activityLogService.getRecentActivityForUser(user.id, Number(limit))
      

      // Enhance logs with diff details
      const enhancedLogs = logs.map(log => ({
        ...log,
        diffDetails: log.diffData ? activityLogService.getDiffDetails(log.diffData) : null,
        diffSummary: log.diffData ? activityLogService.generateDiffSummary(log.diffData) : null
      }))

      res.json({ logs: enhancedLogs })
    } catch (error) {
      console.error('Error fetching recent activity logs:', error)
      res.status(500).json({ error: 'Failed to fetch recent activity logs' })
    }
  }
)

// Get detailed diff information for a specific activity log
router.get('/diff/:logId',
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    try {
      const { logId } = req.params

      const log = await prisma.activityLog.findUnique({
        where: { id: logId },
        include: {
          project: {
            include: {
              projectMemberships: {
                where: { userId: user.id }
              }
            }
          }
        }
      })

      if (!log) {
        res.status(404).json({ error: 'Activity log not found' })
        return
      }

      // Check if user has access to this log's project
      const hasAccess = !log.project || (
        log.project.ownerId === user.id || 
        log.project.projectMemberships.length > 0
      )

      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied to this activity log' })
        return
      }

      if (!log.diffData) {
        res.json({ message: 'No diff data available for this activity log' })
        return
      }

      const diffDetails = activityLogService.getDiffDetails(log.diffData)
      const diffSummary = activityLogService.generateDiffSummary(log.diffData)

      // Get text diffs for each field that has them
      const textDiffs: Record<string, any> = {}
      if (diffDetails) {
        for (const fieldName of diffDetails.fieldsChanged) {
          const textDiff = activityLogService.getTextDiffForField(log.diffData, fieldName)
          if (textDiff) {
            textDiffs[fieldName] = textDiff
          }
        }
      }

      res.json({
        logId: log.id,
        action: log.action,
        message: log.message,
        createdAt: log.createdAt,
        diffDetails,
        diffSummary,
        textDiffs
      })
    } catch (error) {
      console.error('Error fetching activity log diff:', error)
      res.status(500).json({ error: 'Failed to fetch activity log diff' })
    }
  }
)

// Get activity statistics for a project
router.get('/stats/project/:projectId',
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    try {
      const { projectId } = req.params
      const { days = 30 } = req.query

      // Check if user has access to this project
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: user.id
        }
      })

      const isOwner = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: user.id
        }
      })

      if (!projectMember && !isOwner) {
        res.status(403).json({ error: 'Access denied to this project' })
        return
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number(days))

      // Get activity stats
      const activityStats = await prisma.activityLog.groupBy({
        by: ['action'],
        where: {
          projectId,
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          action: true
        }
      })

      // Get daily activity counts
      const dailyActivity = await prisma.activityLog.findMany({
        where: {
          projectId,
          createdAt: {
            gte: startDate
          }
        },
        select: {
          createdAt: true,
          action: true
        }
      })

      // Group by day
      const dailyStats: Record<string, number> = {}
      dailyActivity.forEach(log => {
        const day = log.createdAt.toISOString().split('T')[0]
        dailyStats[day] = (dailyStats[day] || 0) + 1
      })

      res.json({
        period: `${days} days`,
        actionStats: activityStats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        })),
        dailyStats,
        totalActivities: dailyActivity.length
      })
    } catch (error) {
      console.error('Error fetching activity stats:', error)
      res.status(500).json({ error: 'Failed to fetch activity statistics' })
    }
  }
)

export default router
