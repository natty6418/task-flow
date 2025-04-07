import express from 'express';
import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import passport from "../config/passport"
import { User } from '@prisma/client';


const router = express.Router();

router.get('/me', passport.authenticate('jwt', { session: false }),
    (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        res.json(user);
});

router.post('/update', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { name, email } = req.body;
        try {
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { name, email },
            });
            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

router.delete('/delete', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        try {
            await prisma.user.delete({
                where: { id: user.id },
            });
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

export default router;