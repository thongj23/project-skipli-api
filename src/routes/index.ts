import express from 'express';
import ownerRoutes from './owner/owner.route';
import employeeRoutes from './employee/employee.route';
import authRoutes from './auth/auth.route';


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/owner', ownerRoutes);
router.use('/employee', employeeRoutes);

export default router;