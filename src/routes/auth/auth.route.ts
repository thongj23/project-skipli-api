import { Router } from "express";
import { AuthController } from "../../controllers/auth/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/create-access-code", authController.createAccessCode.bind(authController));
router.post("/validate-access-code", authController.validateAccessCode.bind(authController));
router.post("/setup-password", authController.setupPassword.bind(authController));
router.post("/set-cookie", authController.setCookie);
router.get("/protected", authController.protectedRoute);
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post('/logout', authController.logout);
router.post('/login', authController.login.bind(authController));
export default router;