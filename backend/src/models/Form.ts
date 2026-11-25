import mongoose, { Schema, type Document, Types } from "mongoose";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "rating";

export interface IQuestion {
  _id?: Types.ObjectId;
  label: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  order: number;
}

export interface IForm extends Document {
  owner: Types.ObjectId;
  title: string;
  description: string;
  questions: IQuestion[];
  status: "draft" | "published";
}

const questionSchema = new Schema<IQuestion>({
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  type: {
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
  options: {
    type: [String],
    default: [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
});

const formSchema = new Schema<IForm>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

formSchema.index({ owner: 1, updatedAt: -1 });

const Form = mongoose.model<IForm>("Form", formSchema);

export default Form;
