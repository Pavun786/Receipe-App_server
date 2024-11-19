import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './db/dbconfig.js';
import { userRouter } from './routes/users.js';
import { recipesRouter } from './routes/recipes.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors("*"));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello Guys, Please Welcome 💐🎉🎊');
});

app.use('/auth', userRouter);
app.use('/recipes', recipesRouter);

app.listen(port, () => console.log(`Server running at port ${port}`));
