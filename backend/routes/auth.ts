import express from 'express';
import { Request, Response } from 'express';
import passport from "../config/passport"
import { generateToken } from '../config/jwt';
import { User, AuthProvider } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';
import { createSampleDataForUser } from '../services/sampleDataService';
import crypto from 'crypto';

// Store temporary tokens in memory (in production, use Redis or database)
const tempTokenStore = new Map<string, { userId: string, expires: number }>();



const router = express.Router();
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed` }),
    (req: Request, res: Response) => {
        console.log('Google callback hit');
        console.log('User from auth:', req.user);
        
        const user = req.user as User;
        if (!user) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
            return;
        }

        // Generate a temporary token for secure exchange
        const tempToken = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
        
        // Store the temp token with user ID
        tempTokenStore.set(tempToken, { userId: user.id, expires });
        
        console.log('Generated temp token:', tempToken);
        console.log('Session ID:', req.sessionID);
        console.log('Session:', req.session);
        
        // Redirect to verification page with temp token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${tempToken}`);
    }
);

// NEW: This route converts the temporary token into a permanent JWT cookie.
router.get('/token', async (req: Request, res: Response) => {
    console.log('Token route hit');
    
    const tempToken = req.query.token as string;
    console.log('Temp token received:', tempToken);
    
    if (!tempToken) {
        // Fallback to session-based approach
        console.log('No temp token, trying session approach');
        console.log('Session ID:', req.sessionID);
        console.log('Session data:', req.session);
        console.log('User from session:', req.user);
        console.log('Is authenticated:', req.isAuthenticated?.());
        
        if (req.user) {
            const user = req.user as User;
            const token = generateToken({ id: user.id, email: user.email, role: user.role });

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                path: '/'
            });

            res.status(200).json(user);
            return;
        } else {
            console.log('No user found in session, returning 401');
            res.status(401).json({ message: 'Unauthorized - no token or session' });
            return;
        }
    }

    // Check if temp token exists and is valid
    const tokenData = tempTokenStore.get(tempToken);
    
    if (!tokenData) {
        console.log('Temp token not found in store');
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
    
    if (Date.now() > tokenData.expires) {
        console.log('Temp token expired');
        tempTokenStore.delete(tempToken);
        res.status(401).json({ message: 'Token expired' });
        return;
    }
    
    try {
        // Get user from database
        const user = await prisma.user.findUnique({ where: { id: tokenData.userId } });
        
        if (!user) {
            console.log('User not found for temp token');
            tempTokenStore.delete(tempToken);
            res.status(401).json({ message: 'User not found' });
            return;
        }
        
        // Generate JWT token
        const jwtToken = generateToken({ id: user.id, email: user.email, role: user.role });

        res.cookie('jwt', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });

        // Clean up temp token
        tempTokenStore.delete(tempToken);
        
        console.log('Successfully exchanged temp token for JWT');
        res.status(200).json(user);
        
    } catch (error) {
        console.error('Error exchanging token:', error);
        tempTokenStore.delete(tempToken);
        res.status(500).json({ message: 'Internal server error' });
    }
});

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

        // Create sample data for the new user
        await createSampleDataForUser(user);

        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',  // or 'lax' if cross-origin
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
                sameSite: 'none',
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
            sameSite: 'none',
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
                sameSite: 'none',
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