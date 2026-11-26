import type { RequestHandler } from "express";
import { submitResponse } from "../services/response.service.js";

export const submitResponseController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const response = await submitResponse(
      req.params.shareId as string,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Response submitted successfully",
      data: {
        id: response._id,
        createdAt: response.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};