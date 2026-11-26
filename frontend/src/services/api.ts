const API_BASE_URL = "/api";

type ApiError = {
  success: false;
  message: string;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.message || "Something went wrong");
  }

  return data as T;
};
