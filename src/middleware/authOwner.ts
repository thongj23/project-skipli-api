import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'skipli-love';

interface AuthRequest extends Request {
  user?: User;
}

const verifyTokenAndManagerRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Token (cookie) not found' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    req.user = decoded;

    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied: Manager role required' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default verifyTokenAndManagerRole;
