import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user/user.model';
const JWT_SECRET = process.env.JWT_SECRET || 'skipli-love';


interface AuthRequest extends Request {
  user?: User; 
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy token (cookie)' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as User;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export default verifyToken;
