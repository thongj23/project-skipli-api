import { Task } from '../task/task.model';
export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'employee' | 'manager'; 
  department?: 'IT' | 'Sale' | 'Marketing' | 'HR' | 'Customer Support'; // Enum hóa để tránh lỗi chính tả
  status: 'active' | 'inactive';
  tasks: Task[];
  workSchedule: Record<string, string>; 
}
