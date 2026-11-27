import type { QuestionType } from "./form.types";

export interface PublicQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  order: number;
}

export interface PublicFormData {
  shareId: string;
  title: string;
  description: string;
  questions: PublicQuestion[];
}

export type AnswerValue = string | string[] | number;

export interface SubmitResponseInput {
  answers: {
    questionId: string;
    value: AnswerValue;
  }[];
}
