import { auth, db } from "../../config/firebase";
import { Employee } from "../../models/employee/employee.model";
import { User } from "../../models/user/user.model";
import { sendSetupEmail } from '../../services/email/email.service';
export class OwnerService {
 

  async getAllEmployees(): Promise<Employee[]> {
    const snapshot = await db.collection("Employees").get();
    return snapshot.docs.map((doc) => doc.data() as Employee);
  }

  async getEmployee(employeeId: string): Promise<Employee> {
    if (!employeeId) throw new Error("Employee ID is required");
    const employeeDoc = await db.collection("Employees").doc(employeeId).get();
    if (!employeeDoc.exists) throw new Error("Employee not found");
    return employeeDoc.data() as Employee;
  }

async createEmployee(
  name: string,
  email: string
): Promise<{ success: boolean; employeeId: string }> {
  if (!name || !email) throw new Error("All fields are required");

  const userRecord = await auth.createUser({ email });
  const employeeId = userRecord.uid;

  const employee: Employee = {
    employeeId,
    name,
    email,
    tasks: [],
    workSchedule: {},
    role: "employee",
  };

  const user: User = {
    uid: employeeId,
    email,
    role: "employee",
    createdAt: new Date(),
  };
  await db.collection("Employees").doc(employeeId).set(employee);
  await db.collection("Users").doc(employeeId).set(user, { merge: true });
  await sendSetupEmail(email, employeeId);
  return { success: true, employeeId };
}

  async updateEmployee(
    employeeId: string,
    name: string,
    email: string
  ): Promise<{ success: boolean }> {
    if (!employeeId || !name || !email)
      throw new Error("All fields are required");
    await db.collection("Employees").doc(employeeId).update({ name, email });
    await db.collection("Users").doc(employeeId).update({ email });
    return { success: true };
  }

  async deleteEmployee(employeeId: string): Promise<{ success: boolean }> {
    if (!employeeId) throw new Error("Employee ID is required");
    await db.collection("Employees").doc(employeeId).delete();
    await db.collection("Users").doc(employeeId).delete();
    await auth.deleteUser(employeeId);
    return { success: true };
  }

  async setSchedule(
    employeeId: string,
    day: string,
    hours: string
  ): Promise<{ success: boolean }> {
    if (!employeeId || !day || !hours)
      throw new Error("All fields are required");
    await db
      .collection("Employees")
      .doc(employeeId)
      .update({
        [`workSchedule.${day}`]: hours,
      });
    return { success: true };
  }
}
