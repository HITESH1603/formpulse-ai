import { apiRequest } from "./api";
import type {
  Form,
  CreateFormInput,
  UpdateFormInput,
} from "../types/form.types";

interface FormsResponse {
  success: boolean;
  data: Form[];
}

interface FormResponse {
  success: boolean;
  data: Form;
}

export const getForms = async (): Promise<Form[]> => {
  const response = await apiRequest<FormsResponse>("/forms");
  return response.data;
};

export const getForm = async (formId: string): Promise<Form> => {
  const response = await apiRequest<FormResponse>(`/forms/${formId}`);
  return response.data;
};

export const createForm = async (input: CreateFormInput): Promise<Form> => {
  const response = await apiRequest<FormResponse>("/forms", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
};

export const updateForm = async (
  formId: string,
  input: UpdateFormInput,
): Promise<Form> => {
  const response = await apiRequest<FormResponse>(`/forms/${formId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.data;
};

export const publishForm = async (formId: string): Promise<Form> => {
  const response = await apiRequest<FormResponse>(`/forms/${formId}/publish`, {
    method: "POST",
  });

  return response.data;
};

export const closeForm = async (formId: string): Promise<Form> => {
  const response = await apiRequest<FormResponse>(`/forms/${formId}/close`, {
    method: "POST",
  });

  return response.data;
};

export const deleteForm = async (formId: string): Promise<void> => {
  await apiRequest(`/forms/${formId}`, {
    method: "DELETE",
  });
};
