import express from 'express';
import ownerRoutes from './owner/owner.route';
import employeeRoutes from './employee/employee.route';
import authRoutes from './auth/auth.route';
import taskRoutes from './task/task.router'
import userRoutes from './user/user.routes'
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/owner', ownerRoutes);
router.use('/employee', employeeRoutes);
router.use('/task',taskRoutes);
router.use('/user',userRoutes)

export default router;