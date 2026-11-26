import type { RequestHandler } from "express";
import { exportFormResponses } from "../services/response.service.js";

export const exportFormResponsesController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const csv = await exportFormResponses(
      res.locals.userId,
      req.params.id as string,
    );

    res
      .status(200)
      .setHeader("Content-Type", "text/csv; charset=utf-8")
      .setHeader(
        "Content-Disposition",
        'attachment; filename="form-responses.csv"',
      )
      .send(csv);
  } catch (error) {
    next(error);
  }
};
