import express from "express";
import { EmployeeController } from "../../controllers/employee/employee.controller";

const router = express.Router();
const employeeController = new EmployeeController();

router.post("/login", employeeController.login.bind(employeeController));
router.post("/setup", employeeController.setup.bind(employeeController));

export default router;
