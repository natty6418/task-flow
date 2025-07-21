import express from "express"
import { Request, Response } from "express"
import prisma from "../models/prismaClient"
import passport from "passport"
import { Task, User }         // 2. Identify tasks to be removed from this board
        const removedTaskIds = currentTaskIds.filter((taskId: string) => !newTaskIds.includes(taskId));
        const addedTaskIds = newTaskIds.filter((taskId: string) => !currentTaskIds.includes(taskId));

        // 3. Update tasks that are being removed from this board to have boardId = null
        if (removedTaskIds.length > 0) {
          await tx.task.updateMany({
            where: {
              id: { in: removedTaskIds },
              boardId: id, // Make sure we only un-assign from the current board
            },
            data: {
              boardId: null,
            },
          });
        }ient"
import { ProjectMember } from "@prisma/client"
import notificationService from "../services/notificationService"

const router = express.Router()

router.get("/all",
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
        AND: [{ id: projectId }, { projectMemberships: { some: { userId: user.id } } }]
      },
      select: {
        boards: {
          include: {
            tasks: true,
          }
        }
      }
    })
    if (!project) {
      res.status(404).json({ message: "Project not found" })
      return
    }
    const boards = project.boards
    if (!boards || boards.length === 0) {
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

    const { name, projectId, description, status } = req.body;

    if (!name || !projectId) {
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

   

    try {
      const board = await prisma.board.create({
        data: {
          name,
          projectId,
          description: description || "",
          status: status || "TODO",
        }
      });

      // Send notification to project members
      await notificationService.notifyBoardCreated(board.id, user.id);

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
      projectId,
    } = req.body;
    // console.log("updating...", req.body)
    if (!id || !name || !projectId) {
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
      const updatedBoard = await prisma.$transaction(async (tx) => {
        // 1. Get current tasks on the board
        const currentBoard = await tx.board.findUnique({
          where: { id },
          select: { tasks: { select: { id: true } } },
        });
        const currentTaskIds = currentBoard?.tasks.map(t => t.id) || [];
        const newTaskIds = tasks.map((task: Task) => task.id);

        // 2. Identify tasks to be removed from this board
        const removedTaskIds = currentTaskIds.filter(taskId => !newTaskIds.includes(taskId));
        const addedTaskIds = newTaskIds.filter(taskId => !currentTaskIds.includes(taskId));

        // 3. Update tasks that are being removed from this board to have boardId = null
        if (removedTaskIds.length > 0) {
          await tx.task.updateMany({
            where: {
              id: { in: removedTaskIds },
              boardId: id, // Make sure we only un-assign from the current board
            },
            data: {
              boardId: null,
            },
          });
        }

        // 4. Update the board with the new set of tasks.
        // Prisma will handle setting the boardId for newly associated tasks.
        return tx.board.update({
          where: { id },
          data: {
            name,
            description: description || "",
            status: status || "TODO",
            tasks: {
              set: tasks.map((task: Task) => ({ id: task.id })),
            },
          },
          include: {
            tasks: {
              select: {
                title: true,
                boardId: true,
              },
            },
            project: {
              select: {
                name: true,
              },
            },
          },
        });
      });

      // Send notification about board update
      await notificationService.notifyBoardUpdated(id, user.id, name, description);
      
      res.status(200).json(updatedBoard);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }

  }
);

router.delete("/delete/:id",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as User;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const boardId = req.params.id;
    if (!boardId) {
      res.status(400).json({ message: "Bad Request" });
      return;
    }

    try {
      // Get board info before deletion for notification
      const boardToDelete = await prisma.board.findUnique({
        where: { id: boardId },
        select: { name: true, projectId: true }
      });

      const board = await prisma.board.delete({
        where: { id: boardId }
      });

      // Send notification about board deletion
      if (boardToDelete) {
        await notificationService.notifyBoardDeleted(
          boardId, 
          boardToDelete.name, 
          boardToDelete.projectId, 
          user.id
        );
      }

      res.status(200).json(board);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
