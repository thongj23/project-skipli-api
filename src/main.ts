import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import routes from './routes';
import { seedOwnerUser } from './seed/seedOwner';
import { setupSocket, employeeSockets } from './config/socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = setupSocket(server,app);

app.set('io', io);
app.set('employeeSockets', employeeSockets);

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

seedOwnerUser()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server (HTTP + Socket.IO) is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to seed owner user:', error);
    process.exit(1);
  });