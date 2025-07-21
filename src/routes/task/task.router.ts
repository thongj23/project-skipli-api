import { Router } from 'express';
import { TaskController } from '../../controllers/task/task.controller';

const router = Router();
const taskController = new TaskController();


router.get('/:id', taskController.getTaskById.bind(taskController));

router.patch('/:id', taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));

export default router;