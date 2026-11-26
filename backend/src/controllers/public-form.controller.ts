
import type { RequestHandler } from "express";
import { getPublicForm } from "../services/public-form.service.js";

export const getPublicFormController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const form = await getPublicForm(req.params.shareId as string);

    res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error) {
    next(error);
  }
};
