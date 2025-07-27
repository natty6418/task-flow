import express from 'express';
import { Request, Response } from 'express';
import passport from "../config/passport"
import { generateToken } from '../config/jwt';
import { User, AuthProvider } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';



const router = express.Router();
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }), 
    (req: Request, res: Response): void => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',  // or 'lax' if cross-origin
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            path: '/'  // make cookie available for all paths
          });
          res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`); // Redirect to dashboard or any other route
             // Redirect to home or any other route
    }
  );

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
 
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',  // or 'lax' if cross-origin
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            path: '/'  // make cookie available for all paths
          });
        res.json({ message: 'Login successful', token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})


router.post('/signup', async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                authProvider: AuthProvider.CREDENTIALS, // Assuming local auth for signup
            }
        });
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',  // or 'lax' if cross-origin
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            path: '/'  // make cookie available for all paths
          });
          
        res.status(201).json({ message: 'User created successfully', token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout endpoint
router.post('/logout', passport.authenticate('jwt', { session: false }), 
    async (req: Request, res: Response) => {
        try {
            // Clear the JWT cookie
            res.clearCookie('jwt', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });

            res.json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

// Simple logout endpoint (doesn't require valid token)
router.post('/logout-simple', async (req: Request, res: Response) => {
    try {
        // Clear the JWT cookie regardless of token validity
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during simple logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete account endpoint
router.delete('/delete-account', passport.authenticate('jwt', { session: false }), 
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { password, confirmDelete } = req.body;

        // Require explicit confirmation
        if (!confirmDelete || confirmDelete !== 'DELETE_MY_ACCOUNT') {
            res.status(400).json({ 
                message: 'Account deletion requires explicit confirmation. Please provide confirmDelete: "DELETE_MY_ACCOUNT"' 
            });
            return;
        }

        try {
            // For credential-based users, verify password before deletion
            if (user.authProvider === AuthProvider.CREDENTIALS) {
                if (!password) {
                    res.status(400).json({ message: 'Password required for account deletion' });
                    return;
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({ message: 'Invalid password' });
                    return;
                }
            }

            // Start transaction to ensure data consistency
            await prisma.$transaction(async (tx) => {
                // Delete user profile if exists
                await tx.userProfile.deleteMany({
                    where: { userId: user.id }
                });

                // Delete activity logs (they reference the user)
                await tx.activityLog.deleteMany({
                    where: { userId: user.id }
                });

                // Delete notifications for this user
                await tx.notification.deleteMany({
                    where: { userId: user.id }
                });

                // Remove user from project memberships
                await tx.projectMember.deleteMany({
                    where: { userId: user.id }
                });

                // Unassign tasks assigned to this user
                await tx.task.updateMany({
                    where: { assignedToId: user.id },
                    data: { assignedToId: null }
                });

                // Handle owned projects - either delete or transfer ownership
                const ownedProjects = await tx.project.findMany({
                    where: { ownerId: user.id },
                    include: {
                        projectMemberships: {
                            include: { user: true }
                        }
                    }
                });

                for (const project of ownedProjects) {
                    if (project.projectMemberships.length > 0) {
                        // Transfer ownership to the first member
                        const newOwner = project.projectMemberships[0];
                        await tx.project.update({
                            where: { id: project.id },
                            data: { ownerId: newOwner.userId }
                        });
                    } else {
                        // No other members, delete the project and all related data
                        // Delete tasks in the project
                        await tx.task.deleteMany({
                            where: { projectId: project.id }
                        });

                        // Delete boards in the project
                        await tx.board.deleteMany({
                            where: { projectId: project.id }
                        });

                        // Delete notifications for the project
                        await tx.notification.deleteMany({
                            where: { projectId: project.id }
                        });

                        // Delete activity logs for the project
                        await tx.activityLog.deleteMany({
                            where: { projectId: project.id }
                        });

                        // Delete the project
                        await tx.project.delete({
                            where: { id: project.id }
                        });
                    }
                }

                // Finally, delete the user
                await tx.user.delete({
                    where: { id: user.id }
                });
            });

            // Clear the JWT cookie
            res.clearCookie('jwt', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });

            res.json({ 
                message: 'Account deleted successfully. All associated data has been removed or transferred.' 
            });

        } catch (error) {
            console.error('Error deleting account:', error);
            res.status(500).json({ error: 'Failed to delete account. Please try again.' });
        }
    }
);

export default router;