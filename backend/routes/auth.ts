import express from 'express';
import { Request, Response } from 'express';
import passport from "../config/passport"
import { generateToken } from '../config/jwt';
import { User } from '@prisma/client';
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
          res.redirect('http://localhost:3000/');
             // Redirect to home or any other route
    }
  );

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(email, password);
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

export default router;