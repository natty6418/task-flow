import express from 'express';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import auth from "./routes/auth";
import user from "./routes/user";
import passport from './config/passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';



dotenv.config();



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use(cors({
    origin: 'http://localhost:3000', // your frontend domain
    credentials: true               // ✅ allow cookies
  }));


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use('/auth', auth);
app.use('/user', user);

app.get('/ping', (req: Request, res: Response) => {
  res.send('Hello World!');
});



app.listen(PORT, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});