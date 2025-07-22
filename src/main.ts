import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import routes from './routes';
import dotenv from 'dotenv';
const cookieParser = require('cookie-parser');
import { seedOwnerUser } from './seed/seedOwner';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

export const employeeSockets = new Map<string, string>();

io.on('connection', (socket) => {
  const employeeId = socket.handshake.query.employeeId as string;
  if (employeeId) {
    employeeSockets.set(employeeId, socket.id);
    employeeSockets.forEach((socketId, empId) => {
    });
  } else {
  }

  socket.on('disconnect', () => {
    if (employeeId) {
      employeeSockets.delete(employeeId);
  
      if (employeeSockets.size === 0) {
      
      } else {
        employeeSockets.forEach((socketId, empId) => {
        
        });
      }
    }
  });
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.set('io', io);
app.set('employeeSockets', employeeSockets);
app.use(cookieParser());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT;
seedOwnerUser()
  .then(() => {
    server.listen(PORT, () => {
      console.log(` Server (HTTP + Socket.IO) is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to seed owner user:', error);
    process.exit(1);
  });