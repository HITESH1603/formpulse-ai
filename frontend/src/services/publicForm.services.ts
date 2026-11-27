import { apiRequest } from "./api";
import type { PublicFormData, SubmitResponseInput } from "../types/publicForm.types";

interface PublicFormResponse {
  success: boolean;
  data: PublicFormData;
}

interface SubmitResponseResponse {
  success: boolean;
  message: string;
}

export const getPublicForm = async (
  shareId: string,
): Promise<PublicFormData> => {
  const response = await apiRequest<PublicFormResponse>(
    `/public/forms/${encodeURIComponent(shareId)}`,
  );

  return response.data;
};

export const submitPublicResponse = async (
  shareId: string,
  input: SubmitResponseInput,
): Promise<void> => {
  await apiRequest<SubmitResponseResponse>(
    `/public/forms/${encodeURIComponent(shareId)}/responses`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
};
