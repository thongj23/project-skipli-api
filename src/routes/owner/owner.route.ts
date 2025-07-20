import express from 'express';
import { OwnerController } from '../../controllers/owner/owner.controller';
import verifyToken from '../../middleware/auth';

const router = express.Router();
const ownerController = new OwnerController();


router.get('/GetAllEmployees', verifyToken, ownerController.getAllEmployees.bind(ownerController));
router.get('/GetEmployee', verifyToken, ownerController.getEmployee.bind(ownerController));
router.post('', verifyToken, ownerController.createEmployee.bind(ownerController));
router.post('/UpdateEmployee', verifyToken, ownerController.updateEmployee.bind(ownerController));
router.post('/DeleteEmployee', verifyToken, ownerController.deleteEmployee.bind(ownerController));
router.post('/SetSchedule', verifyToken, ownerController.setSchedule.bind(ownerController));

export default router;