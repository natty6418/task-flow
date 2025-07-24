import express from "express"
import { Request, Response } from "express"
import prisma from "../models/prismaClient"
import passport from "passport"
import { User } from "@prisma/client"
import notificationService from "../services/notificationService"

const router = express.Router()


router.get("/all",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user){
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        
        try{
            const tasks = await prisma.task.findMany({
                where:{ assignedToId: user.id },
            });
            res.status(201).json(tasks);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }

    }
)

router.get("/project-tasks",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const projectId = req.query.projectId as string
        if (!projectId) {
            res.status(400).json({ message: "Bad Request" })
            return
        }
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                projectMemberships: { some: { userId: user.id } }
            },
            select: { tasks: true }
        })
        if (!project) {
            res.status(404).json({ message: "Project not found" })
            return
        }
        const tasks = project.tasks
        if (!tasks || tasks.length === 0) {
            res.status(404).json({ message: "Tasks not found" })
            return
        }
        res.json(tasks)
    }
);

router.post("/create",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const { title, description, dueDate, status, boardId, priority, projectId} = req.body
        
        if (!title) {
            res.status(400).json({ message: "Bad Request" })
            return
        }

        if (projectId) {
            const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                projectMemberships: {
                some: {
                    userId: user.id,
                }
                }
            },
            include: {
                projectMemberships: true,
            }
            });

            if (!project) {
            res.status(404).json({ message: "Project not found or access denied" });
            return;
            }
            const membership = await prisma.projectMember.findUnique({
                where: {
                    userId_projectId: { userId: user.id, projectId }
                }
            });
            
            if (membership && (membership.role !== "ADMIN" || project.ownerId !== user.id)) {
                res.status(403).json({ message: "Forbidden" });
                return;
            }

        }

        if (boardId){
            const board = await prisma.board.findUnique({
                where: { id: boardId }
            })
            if (!board) {
                res.status(404).json({ message: "Board not found" })
                return
            }
        }

        
        // Check task exists
        try {
            const newTask = await prisma.task.create({
                data: {
                    title,
                    assignedToId: user.id,
                    description,
                    dueDate: new Date(dueDate),
                    status: status? status : "TODO",
                    boardId: boardId,
                    priority: priority ? priority : "MEDIUM",
                    projectId: projectId
                }
            })
            if (boardId){
                await prisma.board.update({
                    where: { id: boardId },
                    data: {
                        tasks: {
                            connect: { id: newTask.id }
                        }
                    }
                })
            }
            
            // Send notification about task creation
            await notificationService.notifyTaskCreated(newTask.id, user.id, projectId);
            
            res.status(200).json(newTask)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    }

)

router.post("/assign",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const { taskId, userId } = req.body

        if (!taskId || !userId) {
            res.status(400).json({ message: "Bad Request" })
            return
        }

        // 1. First verify the task exists and user has permission
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { projectMemberships: true } } }
        })

        if (!task) {
            res.status(404).json({ message: "Task not found" })
            return
        }

        // 2. Check if current user can assign tasks in this project
        if (task.project) {
            const membership = task.project.projectMemberships.find(m => m.userId === user.id)
            if (!membership || (membership.role !== "ADMIN" && task.project.ownerId !== user.id)) {
                res.status(403).json({ message: "Forbidden: Cannot assign tasks in this project" })
                return
            }
        }

        // 3. Verify the user to be assigned exists and is a project member
        const userToBeAssigned = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!userToBeAssigned) {
            res.status(404).json({ message: "User not found" })
            return
        }

        // 4. If task belongs to a project, ensure the assignee is a project member
        if (task.project) {
            const assigneeMembership = task.project.projectMemberships.find(m => m.userId === userId)
            if (!assigneeMembership) {
                res.status(400).json({ message: "User is not a member of this project" })
                return
            }
        }

        try {
            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: { assignedToId: userId },
                include: {
                    assignedTo: {
                        select: { id: true, name: true, email: true }
                    }
                }
            })

            // Send notification
            await notificationService.notifyTaskAssigned(taskId, userId, user.id)

            res.status(200).json(updatedTask)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    });

router.post("/unassign",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const { taskId } = req.body

        if (!taskId) {
            res.status(400).json({ message: "Bad Request" })
            return
        }

        // 1. First verify the task exists and user has permission
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { 
                project: { include: { projectMemberships: true } },
                assignedTo: { select: { id: true, name: true, email: true } }
            }
        })

        if (!task) {
            res.status(404).json({ message: "Task not found" })
            return
        }

        // 2. Check if current user can unassign tasks in this project
        if (task.project) {
            const membership = task.project.projectMemberships.find(m => m.userId === user.id)
            if (!membership || (membership.role !== "ADMIN" && task.project.ownerId !== user.id)) {
                res.status(403).json({ message: "Forbidden: Cannot unassign tasks in this project" })
                return
            }
        }

        // 3. Check if task is currently assigned
        if (!task.assignedToId) {
            res.status(400).json({ message: "Task is not currently assigned" })
            return
        }

        try {
            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: { assignedToId: null },
                include: {
                    assignedTo: {
                        select: { id: true, name: true, email: true }
                    }
                }
            })

            // Send notification to previously assigned user
            if (task.assignedToId) {
                await notificationService.notifyTaskUnassigned(taskId, task.assignedToId, user.id)
            }

            res.status(200).json(updatedTask)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    });

router.put("/update",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const { id, title, description, status, dueDate, priority } = req.body
        if (!id || !title ) {
            res.status(400).json({ message: "Bad Request: Missing title!" })
            return
        }

        try {
            // Get the original task for comparison
            const originalTask = await prisma.task.findUnique({
                where: { id },
                select: { title: true, description: true, status: true, dueDate: true, priority: true }
            })

            const task = await prisma.task.update({
                where: { id },
                data: { title, 
                    description, 
                    status: status || "TODO", 
                    dueDate: dueDate ? new Date(dueDate) : undefined, 
                    priority: priority || "LOW"
                }
            })

            // Send notification about task update
            if (originalTask) {
                const changes: string[] = []
                if (originalTask.title !== title) changes.push("title")
                if (originalTask.description !== description) changes.push("description")
                if (originalTask.status !== (status || "TODO")) changes.push("status")
                if (originalTask.priority !== (priority || "LOW")) changes.push("priority")
                if (dueDate && originalTask.dueDate?.toISOString() !== new Date(dueDate).toISOString()) changes.push("due date")

                if (changes.length > 0) {
                    // Special notification for task completion
                    if (originalTask.status !== "DONE" && (status === "DONE")) {
                        await notificationService.notifyTaskCompleted(id, user.id)
                    } else {
                        await notificationService.notifyTaskUpdated(id, user.id, changes)
                    }
                }
            }

            res.status(200).json(task)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    }
)
router.delete("/delete/:id",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const { id } = req.params
        if (!id) {
            res.status(400).json({ message: "Bad Request" })
            return
        }

        try {
            // Get task info before deletion for notification
            const taskToDelete = await prisma.task.findUnique({
                where: { id },
                include: {
                    project: { select: { id: true, name: true } },
                    assignedTo: { select: { id: true, name: true } },
                    board: { select: { name: true } }
                }
            })

            const task = await prisma.task.delete({
                where: { id }
            })

            // Send notifications about task deletion
            if (taskToDelete) {
                await notificationService.notifyTaskDeleted(
                    taskToDelete.title,
                    taskToDelete.project?.id,
                    taskToDelete.assignedTo?.id,
                    user.id
                )
            }

            res.status(200).json(task)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    }
)


export default router;