import express from "express"
import { Request, Response } from "express"
import prisma from "../models/prismaClient"
import passport from "passport"
import { User } from "@prisma/client"
import { ProjectMember } from "@prisma/client"

const router = express.Router()

router.get("/all",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user){
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const projectId = req.query.projectId as string
        if (!projectId){
            res.status(400).json({ message: "Bad Request" })
            return
        }
        const project = await prisma.project.findFirst({
            where: { 
                AND: [{ id: projectId }, { projectMemberships: { some: { userId: user.id } } }]
             },
            select: {boards: true }
        })
        if (!project){
            res.status(404).json({ message: "Project not found" })
            return
        }
        const boards = project.boards
        if (!boards || boards.length === 0){
            res.status(404).json({ message: "Boards not found" })
            return
        }
        res.json(boards)
    }
)
router.post("/create",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { name, projectId, taskId } = req.body;

        if (!name || !projectId || !taskId) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }

        // Check user is part of the project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                projectMemberships: {
                    some: {
                        userId: user.id,
                    }
                }
            }
        });

        if (!project) {
            res.status(404).json({ message: "Project not found or access denied" });
            return;
        }

        // Check task exists and belongs to the project
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                projectId
            }
        });

        if (!task) {
            res.status(404).json({ message: "Task not found or doesn't belong to project" });
            return;
        }

        try {
            const board = await prisma.board.create({
                data: {
                    name,
                    projectId,
                    tasks: {
                        connect: { id: taskId }
                    }
                }
            });

            res.status(201).json(board);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put("/update",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const {
            id,
            name,
            description,
            status,
            tasks,
            projectId
        } = req.body;
        if (!id || !name || !description || !status || !tasks || !projectId) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }

        // Check user is part of the project
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
        // Check board exists and belongs to the project
        const board = await prisma.board.findFirst({
            where: {
                id,
                projectId
            }
        });
        if (!board) {
            res.status(404).json({ message: "Board not found or doesn't belong to project" });
            return;
        }
        const projectMember: ProjectMember | undefined = project.projectMemberships.find((member) => member.userId === user.id);

        if (projectMember && projectMember.role !== "ADMIN" && projectMember.role !== "MEMBER") {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        try {
            const updatedBoard = await prisma.board.update({
                where: { id },
                data: {
                    name,
                    description,
                    status,
                    tasks: {
                        set: tasks.map((taskId: string) => ({ id: taskId }))
                    }
                }
            });

            res.status(200).json(updatedBoard);

        } catch (error){
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }

    }
);