import type { RequestHandler } from "express";

const allowedOrigin = process.env.CLIENT_URL;

export const csrfMiddleware: RequestHandler = (req, res, next) => {
  const origin = req.get("Origin");

  if (!allowedOrigin || origin !== allowedOrigin) {
    res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
    return;
  }

  next();
};
