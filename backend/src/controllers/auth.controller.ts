import type { RequestHandler } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";
import { generateToken } from "../utils/token.js";
import { authCookieOptions, clearAuthCookieOptions } from "../utils/cookie.js";

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const user = await loginUser(req.body);
    const token = generateToken(user.id);

    res.cookie("token", token, authCookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    next(error);
  }
};

export const logoutController: RequestHandler = (_req, res) => {
  res.clearCookie("token", clearAuthCookieOptions);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
