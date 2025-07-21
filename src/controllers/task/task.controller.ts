import { Request, Response } from 'express';
import { TaskService } from '../../services/task/task.service';

const taskService = new TaskService();

export class TaskController {
  async getAllTasks(req: Request, res: Response) {
    try {
      const tasks = await taskService.getAllTasks();
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
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
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
}