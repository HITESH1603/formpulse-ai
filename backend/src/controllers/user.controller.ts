import type { RequestHandler } from "express";
import { getUserById } from "../services/user.service.js";

export const getCurrentUserController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const user = await getUserById(res.locals.userId as string);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
      return;
    }

    next(error);
  }
};
