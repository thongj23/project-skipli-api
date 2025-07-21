import express from 'express';
import { OwnerController } from '../../controllers/owner/owner.controller';
import verifyToken from '../../middleware/auth';
import { TaskController } from '../../controllers/task/task.controller';
const router = express.Router();
const ownerController = new OwnerController();
const taskController = new TaskController();

router.get('/GetAllEmployees', verifyToken, ownerController.getAllEmployees.bind(ownerController));
router.get('/GetEmployee', verifyToken, ownerController.getEmployee.bind(ownerController));
router.post('', verifyToken, ownerController.createEmployee.bind(ownerController));
router.patch('/UpdateEmployee', verifyToken, ownerController.updateEmployee.bind(ownerController));
router.post('/DeleteEmployee', verifyToken, ownerController.deleteEmployee.bind(ownerController));
router.post('/SetSchedule', verifyToken, ownerController.setSchedule.bind(ownerController));

router.get('/tasks', taskController.getAllTasks.bind(taskController));
router.post('/tasks', taskController.createTask.bind(taskController));
export default router;