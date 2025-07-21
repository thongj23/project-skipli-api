import { Server as SocketIOServer } from 'socket.io';
import { db } from '../../config/firebase';
import { Task } from '../../models/task/task.model';
import { employeeSockets } from '../../main'; 

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

  async getAllTasks(): Promise<Task[]> {
    const querySnapshot = await this.tasksCollection.get();
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
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
      status: taskData.status || 'pending'
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
}