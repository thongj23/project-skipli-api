import { auth, db } from "../../config/firebase";
import { Employee } from "../../models/employee/employee.model";
import { User } from "../../models/user/user.model";
import { sendSetupEmail } from '../../services/email/email.service';
export class OwnerService {
 

async getAllEmployees(page = 1, limit = 10): Promise<{ data: Employee[]; total: number }> {
  const snapshot = await db.collection("Employees").get();
  const allEmployees = snapshot.docs.map((doc) => doc.data() as Employee);

  const total = allEmployees.length;
  const start = (page - 1) * limit;
  const paginatedData = allEmployees.slice(start, start + limit);

  return { data: paginatedData, total };
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
    status: "active",
    tasks: [],
    workSchedule: {},
    role: "employee",
  };

  const user: User = {
    uid: employeeId,
    role: "employee",
    createdAt: new Date(),
    status: "active",
  };


  await db.collection("Employees").doc(employeeId).set(employee);
  await db.collection("Users").doc(employeeId).set(user, { merge: true });
  await sendSetupEmail(email, employeeId);
  return { success: true, employeeId };
}

async updateEmployee(
  employeeId: string,
  updates: Partial<Pick<Employee, "name" | "email" | "department" | "role" >>
): Promise<{ success: boolean }> {
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields to update");
  }
  await db.collection("Employees").doc(employeeId).update(updates);

  if (updates.email) {
    await db.collection("Users").doc(employeeId).update({
      email: updates.email,
    });
  }

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
