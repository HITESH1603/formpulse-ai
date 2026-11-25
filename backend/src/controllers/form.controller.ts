import type { RequestHandler } from "express";
import {
  createForm,
  getUserForms,
  getFormById,
  updateForm,
  deleteForm,
} from "../services/form.service.js";

export const createFormController: RequestHandler = async (req, res, next) => {
  try {
    const form = await createForm(res.locals.userId as string, req.body);

    res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: form,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFormsController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const forms = await getUserForms(res.locals.userId as string);

    res.status(200).json({
      success: true,
      data: forms,
    });
  } catch (error) {
    next(error);
  }
};

export const getFormByIdController: RequestHandler = async (req, res, next) => {
  try {
    const form = await getFormById(
      res.locals.userId as string,
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFormController: RequestHandler = async (req, res, next) => {
  try {
    const form = await updateForm(
      res.locals.userId as string,
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Form updated successfully",
      data: form,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFormController: RequestHandler = async (req, res, next) => {
  try {
    await deleteForm(res.locals.userId as string, req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Form deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
