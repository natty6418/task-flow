import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request, Response } from 'express';
import auth from "./routes/auth";
import user from "./routes/user";
import passport from './config/passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import project from "./routes/project";
import { NextFunction } from "express";
import task from "./routes/task";
import board from "./routes/board";
import session from 'express-session';
import notificationRoutes from "./routes/notification"
import activityRoutes from "./routes/activity"






const app = express();
app.set('trust proxy', 1); // Trust first proxy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true              
  }));


app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET || 'some-random-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true if using HTTPS
      httpOnly: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    proxy: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());





const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use('/auth', auth);
app.use('/user', user);
app.use('/project', project);
app.use('/task', task);
app.use('/board', board);
app.use("/notification", notificationRoutes)
app.use("/activity", activityRoutes)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler caught:", err);
  res.status(500).json({ error: "Something broke" });
  next();
});
app.get('/ping', (req: Request, res: Response) => {
  res.send('Hello World!');
});

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});