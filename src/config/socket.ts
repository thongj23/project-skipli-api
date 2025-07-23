import { Server } from 'socket.io';
import http from 'http';

export const employeeSockets = new Map<string, string>();

export const setupSocket = (server: http.Server, app: any): Server => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
    path: '/api/socket/io', 
  });

  app.set('io', io);
  app.set('employeeSockets', employeeSockets);

  io.on('connection', (socket) => {
    const employeeId = socket.handshake.query.employeeId as string;

    if (employeeId) {
      employeeSockets.set(employeeId, socket.id);
      console.log(`🔌 [Chat] Connected: ${employeeId} => ${socket.id}`);
    }

    socket.on('chatMessage', (msg) => {
      const { to, from, content } = msg;

      console.log(`Message from ${from} to ${to}: ${content}`);

      const receiverSocketId = employeeSockets.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('chatMessage', msg);
      }

    
      socket.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected socket: ${socket.id}`);
      for (const [key, value] of employeeSockets.entries()) {
        if (value === socket.id) {
          employeeSockets.delete(key);
          console.log(`Removed socket for employeeId: ${key}`);
          break;
        }
      }

    });
  });

  return io;
};
