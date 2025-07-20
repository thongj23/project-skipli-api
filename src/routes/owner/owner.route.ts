import express from 'express';
import { OwnerController } from '../../controllers/owner/owner.controller';
import verifyFirebaseToken from '../../middleware/auth';

const router = express.Router();
const ownerController = new OwnerController();

router.post('/login', ownerController.login.bind(ownerController));
router.post('/GetAllEmployees', verifyFirebaseToken, ownerController.getAllEmployees.bind(ownerController));
router.post('/GetEmployee', verifyFirebaseToken, ownerController.getEmployee.bind(ownerController));
router.post('/CreateEmployee', verifyFirebaseToken, ownerController.createEmployee.bind(ownerController));
router.post('/UpdateEmployee', verifyFirebaseToken, ownerController.updateEmployee.bind(ownerController));
router.post('/DeleteEmployee', verifyFirebaseToken, ownerController.deleteEmployee.bind(ownerController));
router.post('/SetSchedule', verifyFirebaseToken, ownerController.setSchedule.bind(ownerController));

export default router;