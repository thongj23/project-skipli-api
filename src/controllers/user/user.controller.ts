import { Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';

export class UserController {
async getAllUser(req: Request, res: Response) {
  try {
    const users = await UserService.findAllUsers(); 
    res.json(users);
  } catch (error: any) {
    console.error('Get chatable users error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}


}
