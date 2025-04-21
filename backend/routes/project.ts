import express from "express";
import passport from "passport";
import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import { User } from "@prisma/client";

const router = express.Router();
router.post("/create", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { name, description } = req.body;

        try {
            // 1. Create the project
            const project = await prisma.project.create({
                data: {
                    name,
                    description,
                    ownerId: user.id,
                }
            });

            // 2. Add the owner to ProjectMembers as an ADMIN 
            await prisma.projectMember.create({
                data: {
                    userId: user.id,
                    projectId: project.id,
                    role: "ADMIN",  
                }
            });
            await prisma.project.update({
                where: { id: project.id },
                data: {
                    members: {
                        connect: { id: user.id }
                    }
                }
            });

            res.status(201).json(project);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);


router.get("/", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            const projects = await prisma.project.findMany({
                where: { ownerId: user.id },
                include: {
                    projectMemberships: true,   
                    members: true,            
                },
            });
            res.json(projects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get("/search", 
    passport.authenticate("jwt", { session: false }),
    
    async (req: Request, res: Response) => {

        const user = req.user as User;
        const search = req.query.search as string;
        
        if (!search || search.trim() === "") {
            res.status(400).json({ message: "Bad Request" });
            return;
        }
        try {
            const projects = await prisma.project.findMany({
                where: {
                    AND: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            }
                        },
                        {
                            OR: [
                                {
                                    projectMemberships: {
                                        some: {
                                            userId: user.id,
                                        }
                                    }
                                },
                                {
                                    ownerId: user.id
                                }
                            ]
                        }
                    ]
                }
            });
            
            res.json(projects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.post("/addTask",
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User
        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }
        const { title, projectId, description, dueDate, status } = req.body

        if (!title || !projectId) {
            res.status(400).json({ message: "Bad Request" })
            return
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
        })
        if (!project) {
            res.status(404).json({ message: "Project not found" })
            return
        }
        // Check task exists
        try {
            const newTask = await prisma.task.create({
                data: {
                    title,
                    projectId,
                    assignedToId: user.id,
                    description,
                    dueDate: new Date(dueDate),
                    status: status? status : "TODO",

                }
            })
            res.status(200).json(newTask)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    }

)

router.post("/addMember/:id", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }
        const { email, role } = req.body;
        if (!email) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }
        // Check if the project exists
        const project = await prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Check if the user is the owner of the project
        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: { userId: user.id, projectId: id }
            }
        });
        
        if (membership && (membership.role !== "ADMIN" || project.ownerId !== user.id)) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        // Check if the user exists
        const member = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
        if (!member) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if the user is already a member of the project
        const existingMember = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: { userId: member.id, projectId: id }
            }
        });
        if (existingMember) {
            res.status(409).json({ message: "User is already a member of the project" });
            return;
        }
        try {
            const membership = await prisma.projectMember.create({
                data: {
                    userId: member.id,
                    projectId: id,
                    role: role || "MEMBER",  
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    role: true,
                }
            });
            await prisma.project.update({
                where: { id },
                data: {
                    members: {
                        connect: { id: member.id }
                    }
                }
            });
            res.status(201).json(membership);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

router.post("/removeMember/:id", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }
        const { memberId } = req.body;
        if (!memberId) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }
        // Check if the project exists
        const project = await prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Check if the user is the owner of the project
        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: { userId: user.id, projectId: id }
            }
        });
        if (membership && (membership.role !== "ADMIN" || project.ownerId !== user.id)) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        // Check if the user exists
        const member = await prisma.user.findUnique({
            where: { id: memberId },
            select: { id: true }
        });
        if (!member) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if the user is a member of the project
        // const existingMember = await prisma.projectMember.findUnique({
        //     where: {
        //         userId_projectId: { userId: member.id, projectId: id }
        //     }
        // });
        // if (!existingMember) {
        //     res.status(404).json({ message: "User is not a member of the project" });
        //     return;
        // }
        try {
            await prisma.projectMember.delete({
                where: {
                    userId_projectId: { userId: member.id, projectId: id }
                }
            });
            await prisma.project.update({
                where: { id },
                data: {
                    members: {
                        disconnect: { id: member.id }
                    }
                }
            });
            res.status(200).json({ message: "User removed from project" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

router.get("/:id", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        try {
            const project = await prisma.project.findUnique({
                where: { id },
                include:{
                    projectMemberships: {
                        select:{
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                }
                            },
                            role: true,
                        }
                    },   
                    members: true,            
                    tasks: true,
                    boards: true,
                }
            });
            if (!project) {
                res.status(404).json({ message: "Project not found" });
                return;
            }
            res.json(project);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put("/:id", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) =>{
        const user = req.user as User;
        if (!user){
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        if (!id){
            res.status(400).json({ message: "Bad Request" });
            return;
        }
        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });
        if (!project){
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: { userId: user.id, projectId: id }
            }
        });
        
        if (membership && membership.role !== "ADMIN" && project.ownerId !== user.id) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const { name, description } = req.body;
        try {
            const project = await prisma.project.update({
                where: { id },
                data: {
                    name,
                    description,
                }
            });
            res.json(project);
        } catch(error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);





router.delete("/:id", passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }

        // Fetch project
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        // Only owner can delete
        if (project.ownerId !== user.id) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        try {
            // 1. Delete related ProjectMembers first
            await prisma.projectMember.deleteMany({
                where: { projectId: id },
            });
            await prisma.board.deleteMany({
                where: { projectId: id },
            });
            await prisma.task.deleteMany({
                where: { projectId: id },
            });

            // 2. Then delete the project
            await prisma.project.delete({
                where: { id },
            });

            res.json({ message: "Project deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);




export default router;