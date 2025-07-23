import express from 'express';
import { UserController } from '../../controllers/user/user.controller';
import verifyToken from '../../middleware/auth';
const router = express.Router();
const userController  = new UserController();


router.get('/getAllUser', verifyToken, userController.getAllUser.bind(userController));

export default router;