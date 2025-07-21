export interface User {
  uid: string; // Unique identifier (required để đảm bảo mỗi user có ID)
  name?: string;
  email?: string;
  phoneNumber?: string;
  role: 'owner' | 'manager' | 'employee';
  status: 'active' | 'inactive';
  createdAt: Date; 
  setupCompleted?: boolean; 
  accessCode?: string; 
  accessCodeExpiry?: number;
}
