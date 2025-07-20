import { Request, Response } from "express";
import { AuthService } from "../../services/auth/auth.service";

interface AccessCodeRequest extends Request {
  body: {
    phoneNumber?: string;
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

      const result = await this.authService.validateAccessCode(phoneNumber, accessCode);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error: any) {
      console.error("Error in validateAccessCode controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  async setupPassword(req: AccessCodeRequest, res: Response): Promise<Response> {
    try {
      const { employeeId, password } = req.body;

      if (!employeeId || !password) {
        return res.status(400).json({
          success: false,
          message: "Missing employeeId or password.",
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
      return res.status(400).json({ message: "Token is required" });
    }

    this.authService.setAuthCookie(res, token);
    return res.json({ message: "Cookie set successfully" });
  };

  protectedRoute = (req: Request, res: Response): Response => {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({ message: "Access granted", token });
  };
}
