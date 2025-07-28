import { User, Status, Priority, Role } from '@prisma/client';
import prisma from '../models/prismaClient';

export async function createSampleDataForUser(user: User) {
    try {
        // 1. Create a sample project
        const project = await prisma.project.create({
            data: {
                name: "Welcome to TaskFlow!",
                description: "This is a sample project to get you started. Feel free to explore, edit, and delete anything you see here.",
                ownerId: user.id,
            },
        });

        // Add user as a member of the project
        await prisma.projectMember.create({
            data: {
                userId: user.id,
                projectId: project.id,
                role: Role.ADMIN,
            },
        });


        // 2. Create sample boards
        const boardTodo = await prisma.board.create({
            data: {
                name: "To Do",
                projectId: project.id,
                status: Status.TODO,
            },
        });

        const boardInProgress = await prisma.board.create({
            data: {
                name: "In Progress",
                projectId: project.id,
                status: Status.IN_PROGRESS,
            },
        });

        const boardDone = await prisma.board.create({
            data: {
                name: "Done",
                projectId: project.id,
                status: Status.DONE,
            },
        });

        // 3. Create sample tasks
        await prisma.task.createMany({
            data: [
                {
                    title: "Explore the TaskFlow dashboard",
                    description: "Get familiar with the layout, where to find your projects, and how to navigate the app.",
                    status: Status.TODO,
                    priority: Priority.MEDIUM,
                    projectId: project.id,
                    boardId: boardTodo.id,
                    assignedToId: user.id,
                },
                {
                    title: "Create your first task",
                    description: "Try creating a new task in any of the boards.",
                    status: Status.TODO,
                    priority: Priority.LOW,
                    projectId: project.id,
                    boardId: boardTodo.id,
                },
                {
                    title: "Invite a team member",
                    description: "TaskFlow is better with a team. Invite a colleague to your project.",
                    status: Status.IN_PROGRESS,
                    priority: Priority.MEDIUM,
                    projectId: project.id,
                    boardId: boardInProgress.id,
                },
                {
                    title: "Sign up for TaskFlow",
                    description: "Congratulations on starting your journey with TaskFlow!",
                    status: Status.DONE,
                    priority: Priority.HIGH,
                    projectId: project.id,
                    boardId: boardDone.id,
                    assignedToId: user.id,
                },
            ],
        });

        console.log(`Sample data created for user: ${user.email}`);
    } catch (error) {
        console.error(`Failed to create sample data for user ${user.email}:`, error);
        // We don't want to fail the whole signup process if this fails,
        // so we just log the error.
    }
}
