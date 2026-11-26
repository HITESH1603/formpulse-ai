import mongoose, { Schema, type Document, Types } from "mongoose";
import type { QuestionType } from "./Form.js";

export type AnswerValue = string | string[] | number;

export interface IResponseAnswer {
  questionId: Types.ObjectId;
  questionLabel: string;
  questionType: QuestionType;
  value: AnswerValue;
}

export interface IResponse extends Document {
  form: Types.ObjectId;
  answers: IResponseAnswer[];
  createdAt: Date;
  updatedAt: Date;
}
const answerSchema = new Schema<IResponseAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  questionLabel: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    required: true,
    enum: [
      "short_text",
      "long_text",
      "single_choice",
      "multiple_choice",
      "rating",
    ],
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

const responseSchema = new Schema<IResponse>(
  {
    form: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    answers: {
      type: [answerSchema],
      required: true,
    },
  },
  { timestamps: true },
);

responseSchema.index({ form: 1, createdAt: -1 });

const Response = mongoose.model<IResponse>("Response", responseSchema);

export default Response;
