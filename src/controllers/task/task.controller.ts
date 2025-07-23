import { Request, Response } from 'express';
import { TaskService } from '../../services/task/task.service';

const taskService = new TaskService();

export class TaskController {
async getAllTasks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tasks = await taskService.getPaginatedTasks(page, limit);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

  async getTaskById(req: Request, res: Response) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

async createTask(req: Request, res: Response) {
  try {
    const taskData = req.body;
    if (!taskData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = await taskService.createTask(taskData);

    console.log('New task created:', newTask);

    const io = req.app.get('io');
    const employeeSockets = req.app.get('employeeSockets'); 
    const employeeSocketId = employeeSockets.get(newTask.employeeId); 

    if (employeeSocketId) {
      io.to(employeeSocketId).emit('taskCreated', newTask);
    } else {
      console.log('No socket found for employee', newTask.employeeId);
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



 async updateTask(req: Request, res: Response) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

  
    const io = req.app.get('io');
    if (io) {
      io.emit('taskUpdated', task); 
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}


  async deleteTask(req: Request, res: Response) {
    try {
      const deleted = await taskService.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

async getTasksByUserId(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    console.log(userId); 

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await taskService.getTasksByUserIdPaginated(userId, page, limit);

    res.json(result);
  } catch (error) {
    console.error('Error in getTasksByUserId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



async updateTaskStatus(req: Request, res: Response) {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Task ID and status are required' });
    }

    const updatedTask = await taskService.updateTaskStatus(id, status);
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }


    const io = req.app.get('io');
    if (io) {
      io.emit('taskUpdated', updatedTask); 
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



}