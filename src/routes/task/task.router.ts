import { Router } from 'express';
import { TaskController } from '../../controllers/task/task.controller';

const router = Router();
const taskController = new TaskController();


router.get('/:id', taskController.getTaskById.bind(taskController));
router.get('/user/:id',taskController.getTasksByUserId.bind(taskController));
router.patch('/:id', taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));
router.patch('/:id', taskController.updateTask.bind(taskController));

router.patch('', taskController.updateTaskStatus.bind(taskController));
export default router;