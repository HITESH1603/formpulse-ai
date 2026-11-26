import mongoose from "mongoose";
import Form from "../models/Form.js";
import { randomBytes } from "node:crypto";
import Response from "../models/Response.js";
import type {
  CreateFormInput,
  UpdateFormInput,
} from "../validators/form.validator.js";

const validateFormId = (formId: string): void => {
  if (!mongoose.isValidObjectId(formId)) {
    throw new Error("INVALID_FORM_ID");
  }
};

export const createForm = async (userId: string, input: CreateFormInput) => {
  const form = await Form.create({
    ...input,
    owner: userId,
  });

  return form;
};

export const getUserForms = async (userId: string) => {
  const forms = await Form.find({ owner: userId }).sort({
    updatedAt: -1,
  });

  return forms;
};

export const getFormById = async (userId: string, formId: string) => {
  validateFormId(formId);

  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  });

  if (!form) throw new Error("FORM_NOT_FOUND");

  return form;
};

export const updateForm = async (
  userId: string,
  formId: string,
  input: UpdateFormInput,
) => {
  validateFormId(formId);

  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  });

  if (!form) throw new Error("FORM_NOT_FOUND");

  const updateData = { ...input };

  if (input.questions !== undefined) {
    const hasResponses = await Response.exists({ form: form._id });

    if (form.status === "published" && input.questions.length === 0) {
      throw new Error("PUBLISHED_FORM_REQUIRES_QUESTIONS");
    }

    const existingQuestions = new Map(
      form.questions.map((question) => [question._id?.toString(), question]),
    );

    if (hasResponses) {
      if (input.questions.length !== form.questions.length) {
        throw new Error("FORM_QUESTIONS_LOCKED");
      }

      for (const question of input.questions) {
        if (!question.id) {
          throw new Error("FORM_QUESTIONS_LOCKED");
        }

        const existingQuestion = existingQuestions.get(question.id);

        if (!existingQuestion) {
          throw new Error("INVALID_QUESTION_ID");
        }

        if (
          question.type !== existingQuestion.type ||
          question.required !== existingQuestion.required ||
          question.order !== existingQuestion.order ||
          JSON.stringify(question.options) !==
            JSON.stringify(existingQuestion.options)
        ) {
          throw new Error("FORM_QUESTIONS_LOCKED");
        }
      }
    }

    const updatedQuestions = input.questions.map((question) => {
      const { id, ...questionData } = question;

      if (id && !existingQuestions.has(id)) {
        throw new Error("INVALID_QUESTION_ID");
      }

      return id ? { ...questionData, _id: id } : questionData;
    });

    updateData.questions = updatedQuestions;
  }

  form.set(updateData);
  await form.save();

  return form;
};

export const deleteForm = async (userId: string, formId: string) => {
  validateFormId(formId);

  const form = await Form.findOneAndDelete({
    _id: formId,
    owner: userId,
  });

  if (!form) throw new Error("FORM_NOT_FOUND");

  await Response.deleteMany({ form: form._id });

  return form;
};

export const publishForm = async (userId: string, formId: string) => {
  validateFormId(formId);

  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  });

  if (!form) throw new Error("FORM_NOT_FOUND");

  if (form.questions.length === 0) {
    throw new Error("FORM_CANNOT_BE_PUBLISHED");
  }

  if (!form.shareId) {
    form.shareId = randomBytes(16).toString("hex");
  }

  form.status = "published";
  await form.save();
  return form;
};

export const closeForm = async (userId: string, formId: string) => {
  validateFormId(formId);

  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  });

  if (!form) throw new Error("FORM_NOT_FOUND");

  if (form.status !== "published") {
    throw new Error("FORM_CANNOT_BE_CLOSED");
  }

  form.status = "closed";
  await form.save();

  return form;
};
