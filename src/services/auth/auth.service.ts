import { db } from "../../config/firebase";
import { User } from "../../models/user/user.model";
import admin from "firebase-admin";
import { Response } from "express";
import jwt from "jsonwebtoken";

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
  accessToken?: string;
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
        expiresIn: "15m",
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

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Verification successful.",
        accessToken,
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

  async setupPassword(employeeId: string, password: string): Promise<{ success: boolean; message: string; accessToken?: string }> {
    try {
      const user = await admin.auth().getUser(employeeId);

      if (!user) {
        return { success: false, message: "User not found." };
      }

      await admin.auth().updateUser(employeeId, {
        password,
      });

      const token = await admin.auth().createCustomToken(employeeId);

      return {
        success: true,
        message: "Password setup successful.",
        accessToken: token,
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
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        uid: userDoc.id,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        name: userData.name,
      },
    };
  } catch (error: any) {
    console.error("refreshAccessToken error:", error);
    return { success: false, message: "Invalid or expired refresh token." };
  }
}
}
