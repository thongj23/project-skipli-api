import { Request, Response } from "express";
import { OwnerService } from "../../services/owner/owner.service";

import { User } from "../../models/user/user.model";

import { Employee } from "../../models/employee/employee.model";

interface LoginRequest extends Request {
  body: Partial<User>;
}

interface EmployeeRequest extends Request {
  body: Partial<Employee> & { day?: string; hours?: string };
}

export class OwnerController {
  private ownerService: OwnerService;

  constructor() {
    this.ownerService = new OwnerService();
   
  }

//get all employee
  async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await this.ownerService.getAllEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
//get employee by id
  async getEmployee(req: EmployeeRequest, res: Response) {
    try {
      const { employeeId } = req.body;
      if (!employeeId) throw new Error("Employee ID is required");
      const employee = await this.ownerService.getEmployee(employeeId);
      res.json(employee);
    } catch (error: any) {
      res
        .status(error.message === "Employee not found" ? 404 : 500)
        .json({ error: error.message });
    }
  }
//create employee
  async createEmployee(req: EmployeeRequest, res: Response) {
    try {
      const { name, email } = req.body;
      if (!name || !email  )
        throw new Error("All fields are required");
      const result = await this.ownerService.createEmployee(
        name,
        email,
      );
   
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
//update employee
  async updateEmployee(req: EmployeeRequest, res: Response) {
    try {
      const { employeeId, name, email } = req.body;
      if (!employeeId || !name || !email)
        throw new Error("All fields are required");
      const result = await this.ownerService.updateEmployee(
        employeeId,
        name,
        email
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
//delete employee
  async deleteEmployee(req: EmployeeRequest, res: Response) {
    try {
      const { employeeId } = req.body;
      if (!employeeId) throw new Error("Employee ID is required");
      const result = await this.ownerService.deleteEmployee(employeeId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
//set schedule for employee
  async setSchedule(req: EmployeeRequest, res: Response) {
    try {
      const { employeeId, day, hours } = req.body;
      if (!employeeId || !day || !hours)
        throw new Error("All fields are required");
      const result = await this.ownerService.setSchedule(
        employeeId,
        day,
        hours
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
