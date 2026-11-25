import { Router } from "express";
import validateRequest from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../middleware/rate-limit.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import {
  registerController,
  loginController,
  logoutController,
} from "../controllers/auth.controller.js";
import { getCurrentUserController } from "../controllers/user.controller.js";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  validateRequest(registerSchema),
  registerController,
);

router.post(
  "/login",
  loginRateLimiter,
  validateRequest(loginSchema),
  loginController,
);

router.post("/logout", logoutController);

router.get("/me", authMiddleware, getCurrentUserController);

export default router;
