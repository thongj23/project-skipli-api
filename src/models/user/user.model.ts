export interface User {
  uid?: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  role: "owner" | "employee" | "manager";
  createdAt: Date;
  setupCompleted?: boolean;
  accessCode?: string;
  accessCodeExpiry?: number;
}
