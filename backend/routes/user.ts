import express from 'express';
import { Request, Response } from 'express';
import prisma from '../models/prismaClient';
import passport from "../config/passport"
import { User } from '@prisma/client';


const router = express.Router();

router.get('/me', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userInfo = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              projects: true,
              ownedProjects: true,
              assignedTasks: true,
              projectMemberships: true,
              profile: true
            }
          });

        console.log(userInfo)
          
        res.json(userInfo);
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

// Get user profile
router.get('/profile', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        
        try {
            const profile = await prisma.userProfile.findUnique({
                where: { userId: user.id },
            });
            
            if (!profile) {
                res.status(404).json({ message: 'Profile not found' });
                return;
            }
            
            res.json(profile);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }
);

// Create or update user profile
router.post('/profile', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        
        const { bio, avatarUrl, jobTitle, location, company, phone } = req.body;
        
        try {
            // Check if profile already exists
            const existingProfile = await prisma.userProfile.findUnique({
                where: { userId: user.id },
            });
            
            let profile;
            if (existingProfile) {
                // Update existing profile
                profile = await prisma.userProfile.update({
                    where: { userId: user.id },
                    data: {
                        bio,
                        avatarUrl,
                        jobTitle,
                        location,
                        company,
                        phone,
                    },
                });
            } else {
                // Create new profile
                profile = await prisma.userProfile.create({
                    data: {
                        userId: user.id,
                        bio,
                        avatarUrl,
                        jobTitle,
                        location,
                        company,
                        phone,
                    },
                });
            }
            
            res.json(profile);
        } catch (error) {
            console.error('Error creating/updating user profile:', error);
            res.status(500).json({ error: 'Failed to save profile' });
        }
    }
);

// Update specific profile fields
router.patch('/profile', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        
        const updateData = req.body;
        
        // Filter out undefined values and only allow valid profile fields
        const allowedFields = ['bio', 'avatarUrl', 'jobTitle', 'location', 'company', 'phone'];
        const filteredData: any = {};
        
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }
        
        if (Object.keys(filteredData).length === 0) {
            res.status(400).json({ error: 'No valid fields provided for update' });
            return;
        }
        
        try {
            // Check if profile exists
            const existingProfile = await prisma.userProfile.findUnique({
                where: { userId: user.id },
            });
            
            let profile;
            if (existingProfile) {
                // Update existing profile
                profile = await prisma.userProfile.update({
                    where: { userId: user.id },
                    data: filteredData,
                });
            } else {
                // Create new profile with provided data
                profile = await prisma.userProfile.create({
                    data: {
                        userId: user.id,
                        ...filteredData,
                    },
                });
            }

            
            
            res.json(profile);
        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
);

// Delete user profile
router.delete('/profile', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        
        try {
            const profile = await prisma.userProfile.findUnique({
                where: { userId: user.id },
            });
            
            if (!profile) {
                res.status(404).json({ message: 'Profile not found' });
                return;
            }
            
            await prisma.userProfile.delete({
                where: { userId: user.id },
            });
            
            res.json({ message: 'Profile deleted successfully' });
        } catch (error) {
            console.error('Error deleting user profile:', error);
            res.status(500).json({ error: 'Failed to delete profile' });
        }
    }
);

// Upload avatar (placeholder for file upload logic)
router.post('/profile/avatar', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        
        const { avatarUrl } = req.body;
        
        if (!avatarUrl) {
            res.status(400).json({ error: 'Avatar URL is required' });
            return;
        }
        
        try {
            // Check if profile exists
            const existingProfile = await prisma.userProfile.findUnique({
                where: { userId: user.id },
            });
            
            let profile;
            if (existingProfile) {
                // Update existing profile
                profile = await prisma.userProfile.update({
                    where: { userId: user.id },
                    data: { avatarUrl },
                });
            } else {
                // Create new profile with avatar
                profile = await prisma.userProfile.create({
                    data: {
                        userId: user.id,
                        avatarUrl,
                    },
                });
            }
            
            res.json({ avatarUrl: profile.avatarUrl });
        } catch (error) {
            console.error('Error updating avatar:', error);
            res.status(500).json({ error: 'Failed to update avatar' });
        }
    }
);

export default router;