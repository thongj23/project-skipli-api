import { db } from '../../config/firebase';
import { User } from '../../models/user/user.model';


export class EmployeeService {
  async login(uid: string, email: string, role: 'manager' | 'employee' = 'employee'): Promise<{ success: boolean; uid: string }> {
    if (!uid || !email) throw new Error('UID and email are required');
    const user: User = {
      uid,
      
      email,
      status: "active",
      role,
      createdAt: new Date(),
    };
    await db.collection('Users').doc(uid).set(user, { merge: true });
    return { success: true, uid };
  }

  async setup(uid: string): Promise<{ success: boolean }> {
    if (!uid) throw new Error('UID is required');
    await db.collection('Users').doc(uid).update({ setupCompleted: true });
    return { success: true };
  }
}