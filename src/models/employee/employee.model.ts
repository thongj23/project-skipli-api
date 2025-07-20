export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  department?: string;
  tasks: any[];
  workSchedule: Record<string, string>;
  role: 'employee';
}