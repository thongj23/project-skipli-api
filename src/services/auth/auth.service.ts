
import { db } from "../../config/firebase";
import { User } from "../../models/user/user.model";
import admin from "firebase-admin";
import { Response } from "express";
import jwt from "jsonwebtoken";

import bcrypt from 'bcryptjs'; 

import { Employee } from '../../models/employee/employee.model';
import { log } from "console";
interface AccessCodeResponse {
  success: boolean;
  message: string;
  phoneNumber?: string;
  accessCode?: string;
  expiresIn?: string;
}

export interface AuthUser {
  uid: string;
  phoneNumber: string;
  role: "owner" | "manager" | "employee";
  name?: string;
}

export interface ValidateAccessCodeResult {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
}

export class AuthService {
  async generateAndSaveAccessCode(phoneNumber: string): Promise<AccessCodeResponse> {
    try {
      if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
        return { success: false, message: "Invalid phone number." };
      }

      const formattedPhone = phoneNumber.trim();
      const userQuery = await db
        .collection("Users")
        .where("phoneNumber", "==", formattedPhone)
        .limit(1)
        .get();

      if (userQuery.empty) {
        return { success: false, message: "Phone number is not registered." };
      }

      const userDoc = userQuery.docs[0];
      const user = userDoc.data() as Partial<User>;

      if (user.role !== "manager") {
        return { success: false, message: "Only managers can receive an access code." };
      }

      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await userDoc.ref.set(
        {
          accessCode,
          accessCodeExpiry: expiresAt,
        },
        { merge: true }
      );

      return {
        success: true,
        message: "Access code generated.",
        phoneNumber: user.phoneNumber,
        accessCode,
        expiresIn: "expiresIn",
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Error generating access code.",
      };
    }
  }

  async validateAccessCode(phoneNumber: string, accessCode: string): Promise<ValidateAccessCodeResult> {
    try {
      if (!phoneNumber || !accessCode) {
        return { success: false, message: "Phone number and access code are required." };
      }

      const userQuery = await db
        .collection("Users")
        .where("phoneNumber", "==", phoneNumber.trim())
        .limit(1)
        .get();

      if (userQuery.empty) {
        return { success: false, message: "Phone number not found." };
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data() as Partial<User>;

      if (!userData.accessCode || userData.accessCode !== accessCode) {
        return { success: false, message: "Invalid access code." };
      }

      if (userData.accessCodeExpiry && Date.now() > userData.accessCodeExpiry) {
        return { success: false, message: "Access code has expired." };
      }

      if (!userData.phoneNumber || !userData.role) {
        return { success: false, message: "Missing user data (phone number or role)." };
      }

      await userDoc.ref.update({ accessCode: "", accessCodeExpiry: null });

      const payload = {
        uid: userDoc.id,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Verification successful.",
        token,
        refreshToken,
        user: {
          uid: userDoc.id,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          name: userData.name,
        },
      };
    } catch (error: any) {
      console.error("validateAccessCode error:", error);
      return { success: false, message: "Error validating access code." };
    }
  }

 async setupPassword(employeeId: string, password: string): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const user = await admin.auth().getUser(employeeId);

    if (!user) {
      return { success: false, message: "User not found." };
    }

  
    await admin.auth().updateUser(employeeId, {
      password,
    });

  
    const token = await admin.auth().createCustomToken(employeeId);

  
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

  
    await db.collection('Employees').doc(employeeId).update({
      passwordHash: hashedPassword,
      passwordSetup: true,
      passwordUpdatedAt: new Date(),
    });

    return {
      success: true,
      message: "Password setup successful.",
      token: token,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error updating password.",
    };
  }
}
  
  setAuthCookie(res: Response, token: string): void {
   res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", 
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

  }
  async refreshAccessToken(refreshToken: string): Promise<ValidateAccessCodeResult> {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key") as {
      uid: string;
      phoneNumber: string;
      role: string;
    };
    const userDoc = await db.collection("Users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return { success: false, message: "User not found." };
    }

    const userData = userDoc.data() as Partial<User>;

    if (!userData.phoneNumber || !userData.role) {
      return { success: false, message: "Missing user data." };
    }

    const payload = {
      uid: userDoc.id,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });
    const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key", {
      expiresIn: "7d",
    });

    return {
      success: true,
      message: "Token refreshed successfully.",
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        uid: userDoc.id,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        name: userData.name,
      },
    };
  } catch (error: any) {
    console.error("refreshToken error:", error);
    return { success: false, message: "Invalid or expired refresh token." };
  }
}

async  loginWithEmailAndPassword(email: string, password: string) {
  console.log(email,password)
  const employeeRef = db.collection('Employees');
  const querySnapshot = await employeeRef.where('email', '==', email).get();

  if (querySnapshot.empty) {
    return {
      success: false,
      message: 'Email không tồn tại.',
    };
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  const isMatch = await bcrypt.compare(password, userData.passwordHash);
  if (!isMatch) {
    return {
      success: false,
      message: 'Mật khẩu không đúng.',
    };
  }

  const token = jwt.sign(
    { userId: userDoc.id, role: 'employee' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { userId: userDoc.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return {
    success: true,
    message: 'Đăng nhập thành công',
    user: {
      id: userDoc.id,
      ...userData,
    },
    token,
    refreshToken,
  };
}
}
