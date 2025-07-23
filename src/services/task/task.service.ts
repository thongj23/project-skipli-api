import { Server as SocketIOServer } from 'socket.io';
import { db } from '../../config/firebase';
import { Task } from '../../models/task/task.model';
import { employeeSockets } from '../../config/socket'; 
import * as admin from 'firebase-admin';

export class TaskService {
  private io: SocketIOServer | null = null;
  private tasksCollection = db.collection('tasks');

  private emitToEmployee(employeeId: string, event: string, payload: any) {
  if (!this.io) return;

  const socketSet = employeeSockets.get(employeeId);
  if (socketSet) {
    for (const socketId of socketSet) {
      this.io.to(socketId).emit(event, payload);
    }
  }
}

  setSocketIO(io: SocketIOServer) {
    this.io = io;

   this.tasksCollection.onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const task = { id: change.doc.id, ...change.doc.data() } as Task;

    if (change.type === 'added') {
      this.emitToEmployee(task.employeeId, 'taskCreated', task);
    } else if (change.type === 'modified') {
      this.emitToEmployee(task.employeeId, 'taskUpdated', task);
    } else if (change.type === 'removed') {
      this.emitToEmployee(task.employeeId, 'taskDeleted', task.id);
    }
  });
});

  }

async getPaginatedTasks(page: number, limit: number): Promise<Task[]> {
  const offset = (page - 1) * limit;

 
  let query = this.tasksCollection.orderBy('createdAt', 'desc').limit(limit);

 
  if (page > 1) {
    const snapshot = await this.tasksCollection
      .orderBy('createdAt', 'desc')
      .limit(offset)
      .get();

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
  }
  const pageSnapshot = await query.get();

  return pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
}



  async getTaskById(id: string): Promise<Task | undefined> {
    const docRef = this.tasksCollection.doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return undefined;
    return { id: docSnap.id, ...docSnap.data() } as Task;
  }

  async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    const docRef = await this.tasksCollection.add({
      ...taskData,
       employeeId: taskData.employeeId,
      status: taskData.status || 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const newTask = { id: docRef.id, ...taskData } as Task;
    return newTask;
  }

  async updateTask(id: string, updateData: Partial<Task>): Promise<Task | undefined> {
    const docRef = this.tasksCollection.doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return undefined;
    
    await docRef.update(updateData);
    const updatedTask = { id, ...docSnap.data(), ...updateData } as Task;
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const docRef = this.tasksCollection.doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return false;
    
    await docRef.delete();
    return true;
  }

async getTasksByUserIdPaginated(userId: string, page: number, limit: number): Promise<{ tasks: Task[]; total: number }> {
  const offset = (page - 1) * limit;

  const totalSnapshot = await this.tasksCollection.where('employeeId', '==', userId).get();
  const total = totalSnapshot.size;

  let query = this.tasksCollection
    .where('employeeId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit);

  if (page > 1) {
    const offsetSnapshot = await this.tasksCollection
      .where('employeeId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(offset)
      .get();

    const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
  }

  const pageSnapshot = await query.get();
  const tasks = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

  return { tasks, total };
}




async updateTaskStatus(taskId: string, status: string): Promise<Task | null> {
  const docRef = this.tasksCollection.doc(taskId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return null;

  await docRef.update({ status });

  const updatedTask = { id: docRef.id, ...docSnap.data(), status } as Task;
  return updatedTask;
}



}