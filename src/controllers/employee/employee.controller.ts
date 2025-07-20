import { Request, Response } from "express";
import { EmployeeService } from "../../services/employee/employee.service";
import { User } from "../../models/user/user.model";
interface LoginRequest extends Request {
  body: Partial<User>;
}
interface SetupRequest extends Request {
  body: { uid: string };
}

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }
//login empoyee
  async login(req: LoginRequest, res: Response) {
    try {
      const { uid, email, role } = req.body;
      if (!uid || !email) throw new Error("UID and email are required");
      const result = await this.employeeService.login(
        uid,
        email,
        role as "manager" | "employee"
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async setup(req: SetupRequest, res: Response) {
    try {
      const { uid } = req.body;
      if (!uid) throw new Error("UID is required");
      const result = await this.employeeService.setup(uid);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
