import { auth } from '../config/firebase';
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}
const verifyToken = async (req: AuthRequest, res: Response,next: NextFunction)=>{
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  try{
    const decodedToken =  await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  }catch(error){
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
}
export default verifyToken;
