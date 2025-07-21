export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  employeeId:string,
  status: 'pending' | 'in_progress' | 'completed';
}
