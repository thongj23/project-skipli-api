import { Server, Socket } from 'socket.io';
import { SocketService } from '../../services/sockets/socket.service';

export class SocketController {
  private io: Server;
  private socketService: SocketService;
  public userSockets: Map<string, string> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.socketService = new SocketService();
  }

  setupSocket(): void {
    this.io.on('connection', (socket: Socket) => {
  const employeeId = socket.handshake.query.employeeId as string;
  console.log('New connection from employeeId:', employeeId, 'socket.id:', socket.id);

  if (employeeId) {
    this.userSockets.set(employeeId, socket.id);
    console.log('Stored socket for employee:', employeeId);
  } else {
    console.warn(' No employeeId provided in query!');
  }

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    this.userSockets.forEach((id, key) => {
      if (id === socket.id) this.userSockets.delete(key);
    });
  });
});

  }
}
