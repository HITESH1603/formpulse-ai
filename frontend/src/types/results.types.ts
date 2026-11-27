export interface RatingAnalytics {
  questionId: string;
  label: string;
  type: "rating";
  average: number | null;
  totalRatings: number;
}

export interface ChoiceAnalytics {
  questionId: string;
  label: string;
  type: "single_choice" | "multiple_choice";
  options: {
    label: string;
    count: number;
  }[];
}

export type QuestionAnalytics = RatingAnalytics | ChoiceAnalytics;

export interface FormAnalytics {
  totalResponses: number;
  questions: QuestionAnalytics[];
}

export interface FormResponse {
  _id: string;
  createdAt: string;
  answers: {
    questionId: string;
    questionLabel: string;
    questionType: string;
    value: string | string[] | number;
  }[];
}

export interface ResponsePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FormResponsesResult {
  success: true;
  data: FormResponse[];
  pagination: ResponsePagination;
}
