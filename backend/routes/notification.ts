import express from "express"
import { Request, Response } from "express"
import prisma from "../models/prismaClient"
import passport from "passport"
import { User } from "@prisma/client"

const router = express.Router()

// Optimized endpoint for polling - only returns unread count and recent notifications
router.get("/poll",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const { lastCheck } = req.query
    const since = lastCheck ? new Date(lastCheck as string) : new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours as fallback

    try {
      // Get unread count
      const unreadCount = await prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false
        }
      })

      // Get recent notifications since last check
      const recentNotifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
          createdAt: { gt: since }
        },
        include: {
          project: { select: { name: true } },
          task: { select: { title: true } },
          board: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit to recent 10
      })

      res.json({
        unreadCount,
        recentNotifications,
        lastChecked: new Date().toISOString()
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
)

// Full notifications endpoint for when user opens notification panel
router.get("/",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const { page = 1, limit = 20 } = req.query

    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        include: {
          project: { select: { name: true } },
          task: { select: { title: true } },
          board: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      })

      const total = await prisma.notification.count({
        where: { userId: user.id }
      })

      res.json({
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
)

// Mark notification as read
router.patch("/:id/read",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    const { id } = req.params

    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    try {
      await prisma.notification.update({
        where: {
          id,
          userId: user.id
        },
        data: { isRead: true }
      })

      res.json({ success: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
)

// Mark all notifications as read
router.patch("/read-all",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User

    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    try {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false
        },
        data: { isRead: true }
      })

      res.json({ success: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
)

export default router