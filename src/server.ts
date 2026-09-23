import express from 'express';
import 'dotenv/config';
import postRouter from './routes/postRoutes.js';

const app = express();

app.use(express.json());
app.use('/posts', postRouter);


const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})