import type { RequestHandler } from "express";
import { getFormResponses } from "../services/response.service.js";
import { responseQuerySchema } from "../validators/response-query.validator.js";

export const getFormResponsesController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const queryResult = responseQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        errors: queryResult.error.issues,
      });
      return;
    }

    const { page, limit } = queryResult.data;

    const result = await getFormResponses(
      res.locals.userId,
      req.params.id as string,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: result.responses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
