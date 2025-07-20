import { Server, Socket } from "socket.io";
import { auth, db } from "../config/firebase";
import { Message } from "../models/message/message.model";

interface MessageData {
  receiverId: string;
  message: string;
}

export const setupSocket = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    const token = socket.handshake.auth.token as string;
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const uid = decodedToken.uid;
      socket.join(uid);

      socket.on("sendMessage", async ({ receiverId, message }: MessageData) => {
        const messageData: Message = {
          senderId: uid,
          receiverId,
          message,
          timestamp: new Date(),
        };
        await db.collection("Messages").add(messageData);
        io.to(receiverId).emit("receiveMessage", messageData);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", uid);
      });
    } catch (error: any) {
      socket.disconnect();
      console.log("Invalid token:", error.message);
    }
  });
};
