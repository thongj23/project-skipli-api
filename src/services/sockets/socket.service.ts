  import { db } from '../../config/firebase';

  export class SocketService {
    async createConversation(userId1: string, userId2: string): Promise<string> {
      const participants = [userId1, userId2].sort(); 
      const conversationId = participants.join('_'); 

      try {
        const conversationRef = db.collection('conversations').doc(conversationId);
        const docSnap = await conversationRef.get();

        if (!docSnap.exists) {
          await conversationRef.set({
            participants,
            createdAt: new Date().toISOString(),
          });
          console.log('Firestore: Created new conversation:', conversationId);
        }

        return conversationId;
      } catch (error) {
        console.error('Firestore: Error creating conversation:', error);
        throw error;
      }
    }

    async saveMessage(conversationId: string, senderId: string, content: string): Promise<void> {
      try {
        const messagesRef = db
          .collection('conversations')
          .doc(conversationId)
          .collection('messages');

        await messagesRef.add({
          senderId,
          content,
          timestamp: new Date().toISOString(),
        });

        console.log(' Firestore: Message saved');
      } catch (error) {
        console.error(' Firestore: Error saving message:', error);
        throw error;
      }
    }

    async getMessages(conversationId: string): Promise<any[]> {
      try {
        const messagesRef = db
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .orderBy('timestamp', 'asc');

        const snapshot = await messagesRef.get();

        return snapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error(' Firestore: Error getting messages:', error);
        throw error;
      }
    }
  }
