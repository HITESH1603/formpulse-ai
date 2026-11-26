
export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "rating";

export interface Question {
  id?: string;
  label: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  order: number;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: "draft" | "published" | "closed";
  shareId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormInput {
  title: string;
  description: string;
  questions: Omit<Question, "id">[];
}

export interface UpdateFormInput {
  title?: string;
  description?: string;
  questions?: Question[];
}
