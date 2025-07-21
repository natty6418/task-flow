import express from "express"
import { Request, Response } from "express"
import prisma from "../models/prismaClient"
import passport from "passport"
import { User } from "@prisma/client"

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
            const task = await prisma.task.update({
                where: { id },
                data: { title, 
                    description, 
                    status: status || "TODO", 
                    dueDate: dueDate ? new Date(dueDate) : undefined, 
                    priority: priority || "LOW"
                }
            })
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
            const task = await prisma.task.delete({
                where: { id }
            })
            res.status(200).json(task)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    }
)


export default router;