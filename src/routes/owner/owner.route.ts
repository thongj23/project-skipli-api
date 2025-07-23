import express from 'express';
import { OwnerController } from '../../controllers/owner/owner.controller';
import verifyTokenAndManagerRole from '../../middleware/authOwner';
import { TaskController } from '../../controllers/task/task.controller';
const router = express.Router();
const ownerController = new OwnerController();
const taskController = new TaskController();

router.get('/GetAllEmployees', verifyTokenAndManagerRole, ownerController.getAllEmployees.bind(ownerController));
router.get('/GetEmployee', verifyTokenAndManagerRole, ownerController.getEmployee.bind(ownerController));
router.post('', verifyTokenAndManagerRole, ownerController.createEmployee.bind(ownerController));
router.patch('/UpdateEmployee', verifyTokenAndManagerRole, ownerController.updateEmployee.bind(ownerController));
router.post('/DeleteEmployee', verifyTokenAndManagerRole, ownerController.deleteEmployee.bind(ownerController));
router.post('/SetSchedule', verifyTokenAndManagerRole, ownerController.setSchedule.bind(ownerController));

router.get('/tasks', taskController.getAllTasks.bind(taskController));
router.post('/tasks', taskController.createTask.bind(taskController));
export default router;