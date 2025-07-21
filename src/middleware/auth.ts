import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'skipli-love';

interface AuthRequest extends Request {
  user?: User;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Token (cookie) not found' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as User; 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default verifyToken;
