import { apiRequest } from "./api";
import type {
  FormAnalytics,
  FormResponsesResult,
} from "../types/results.types";

interface AnalyticsApiResponse {
  success: true;
  data: FormAnalytics;
}

export const getFormAnalytics = async (
  formId: string,
): Promise<FormAnalytics> => {
  const response = await apiRequest<AnalyticsApiResponse>(
    `/forms/${formId}/analytics`,
  );

  return response.data;
};

export const getFormResponses = async (
  formId: string,
  page: number,
  limit = 10,
): Promise<FormResponsesResult> => {
  return apiRequest<FormResponsesResult>(
    `/forms/${formId}/responses?page=${page}&limit=${limit}`,
  );
};

export const exportFormResponses = async (formId: string): Promise<void> => {
  const response = await fetch(`/api/forms/${formId}/export`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to export responses");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "form-responses.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};
