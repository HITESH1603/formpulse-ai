import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof Error) {
    if (error.message === "INVALID_QUESTION_ID") {
      res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
      return;
    }
    if (error.message === "FORM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Form not found",
      });
      return;
    }

    if (error.message === "INVALID_FORM_ID") {
      res.status(400).json({
        success: false,
        message: "Invalid form ID",
      });
      return;
    }

    if (error.message === "PUBLIC_FORM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Form not found",
      });
      return;
    }

    if (error.message === "FORM_CANNOT_BE_PUBLISHED") {
      res.status(400).json({
        success: false,
        message: "A form must have at least one question before publishing",
      });
      return;
    }

    if (error.message === "FORM_CANNOT_BE_CLOSED") {
      res.status(409).json({
        success: false,
        message: "Only published forms can be closed",
      });
      return;
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON",
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
