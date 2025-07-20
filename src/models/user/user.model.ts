
export interface User {
    uid?: string,
    phoneNumber?:string,
    email?:string,
    role: 'owner' | 'employee' | 'manager';
    createdAt: Date;
    setupCompleted?: boolean;
}