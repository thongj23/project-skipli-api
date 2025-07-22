import { Request, Response } from "express";
import {
  AuthService,
  ValidateAccessCodeResult,
} from "../../services/auth/auth.service";

import jwt, { JwtPayload } from 'jsonwebtoken';

interface AccessCodeRequest extends Request {
  body: {
    phoneNumber?: string;
    email?: string;
    accessCode?: string;
    employeeId?: string;
    password?: string;
    token?: string;
  };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
  }

  async createAccessCode(
    req: AccessCodeRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required.",
        });
      }

      const result = await this.authService.generateAndSaveAccessCode(phoneNumber);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error in createAccessCode controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  async validateAccessCode(
    req: AccessCodeRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { phoneNumber, accessCode } = req.body;

      if (!phoneNumber || !accessCode) {
        return res.status(400).json({
          success: false,
          message: "Phone number and access code are required.",
        });
      }

      const result: ValidateAccessCodeResult =
        await this.authService.validateAccessCode(phoneNumber, accessCode);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message,
        });
      }

      if (!result.refreshToken || !result.token || !result.user) {
        return res.status(500).json({
          success: false,
          message: "Missing tokens or user data in response.",
        });
      }

      this.authService.setAuthCookie(res, result.token);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error("Error in validateAccessCode controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  async setupPassword(
    req: AccessCodeRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { employeeId, password } = req.body;

      if (!employeeId || !password) {
        return res.status(400).json({
          success: false,
          message: "Employee ID and password are required.",
        });
      }

      const result = await this.authService.setupPassword(employeeId, password);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error in setupPassword controller:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while setting up password.",
      });
    }
  }

  setCookie = (req: AccessCodeRequest, res: Response): Response => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    this.authService.setAuthCookie(res, token);
    return res.json({ message: "Cookie set successfully." });
  };

  protectedRoute = (req: Request, res: Response): Response => {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    return res.json({ message: "Access granted.", token });
  };

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "No refresh token provided.",
        });
      }

      const result = await this.authService.refreshAccessToken(refreshToken);

      if (!result.success || !result.token || !result.refreshToken) {
        return res.status(401).json({
          success: false,
          message: result.message || "Invalid refresh token.",
        });
      }

      this.setRefreshTokenCookie(res, result.refreshToken);

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully.",
        token: result.token,
      });
    } catch (error: any) {
      console.error("Error in refreshToken controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  logout = (req: Request, res: Response): Response => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  };

  async login(req: AccessCodeRequest, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      const result = await this.authService.loginWithEmailAndPassword(email, password);

      if (!result.success || !result.token || !result.refreshToken || !result.user) {
        return res.status(401).json({
          success: false,
          message: result.message || "Incorrect email or password.",
        });
      }

      this.authService.setAuthCookie(res, result.token);
      this.setRefreshTokenCookie(res, result.refreshToken);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        user: result.user,
        token: result.token,
      });

    } catch (error: any) {
      console.error("Error in login controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  me(req: Request, res: Response) {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      if (!decoded || typeof decoded === "string" || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or missing user information.",
        });
      }

      return res.json({
        success: true,
        userId: decoded.userId,
        role: decoded.role,
      });
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
  }
}
