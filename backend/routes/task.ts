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
        const { title, description, dueDate, status, boardId } = req.body
        console.log(req.body)
        if (!title) {
            res.status(400).json({ message: "Bad Request" })
            return
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
            console.log(newTask)
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
        const userToBeAssigned = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!userToBeAssigned) {
            res.status(404).json({ message: "User not found" })
            return
        }

        try {
            const task = await prisma.task.update({
                where: { id: taskId },
                data: { assignedToId: userId }
            })
            res.status(200).json(task)
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