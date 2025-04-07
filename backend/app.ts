import express from 'express';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import prisma from './models/prismaClient';

dotenv.config();



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';


app.get('/ping', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/users', async (req: Request, res: Response) => {
    try{
        const users = await prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/users', async (req: Request, res: Response) => {
    const {name, email, password} = req.body;
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});