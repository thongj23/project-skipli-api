import { db } from '../../config/firebase'; 

export class UserService {
  static async findAllUsers() {
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      return [];
    }

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return users;
  }
}
