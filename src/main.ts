import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import routes from './routes';
import { setupSocket } from './sockets/chat';
import dotenv from 'dotenv';
import { seedOwnerUser } from './seed/seedOwner';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

app.use('/api', routes);

setupSocket(io);

const PORT = process.env.PORT || 3004;
seedOwnerUser().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to seed owner user:', error);
  process.exit(1);
});