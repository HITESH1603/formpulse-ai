
import Form from "../models/Form.js";
import type {
  CreateFormInput,
  UpdateFormInput,
} from "../validators/form.validator.js";

export const createForm = async (
  userId: string,
  input: CreateFormInput
) => {
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

export const getFormById = async (
  userId: string,
  formId: string
) => {
  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  });

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }

  return form;
};

export const updateForm = async (
  userId: string,
  formId: string,
  input: UpdateFormInput
) => {
  const form = await Form.findOneAndUpdate(
    {
      _id: formId,
      owner: userId,
    },
    {
      $set: input,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }

  return form;
};

export const deleteForm = async (
  userId: string,
  formId: string
) => {
  const form = await Form.findOneAndDelete({
    _id: formId,
    owner: userId,
  });

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }
};
