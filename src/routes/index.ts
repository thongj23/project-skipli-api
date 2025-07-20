import express from 'express';
import ownerRoutes from './owner/owner.route';
import employeeRoutes from './employee/employee.route';

const router = express.Router();

router.use('/owner', ownerRoutes);
router.use('/employee', employeeRoutes);

export default router;