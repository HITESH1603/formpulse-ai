
import type { RequestHandler } from "express";
import { getFormAnalytics } from "../services/response.service.js";

export const getFormAnalyticsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const analytics = await getFormAnalytics(
      res.locals.userId,
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
