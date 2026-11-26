import mongoose, { Schema, type Document, Types } from "mongoose";
import { randomBytes } from "node:crypto";

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
  status: "draft" | "published" | "closed";
  shareId: string;
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

questionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const result = ret as unknown as Record<string, unknown>;
    result.id = String(result._id);
    delete result._id;
    delete result.__v;
    return result;
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
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    shareId: {
      type: String,
      default: () => randomBytes(16).toString("hex"),
    },
  },
  {
    timestamps: true,
  },
);

formSchema.index({ owner: 1, updatedAt: -1 });

formSchema.index(
  { shareId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      shareId: { $type: "string" },
    },
  },
);

formSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const result = ret as unknown as Record<string, unknown>;
    result.id = String(result._id);
    delete result._id;
    delete result.__v;
    return result;
  },
});

const Form = mongoose.model<IForm>("Form", formSchema);

export default Form;
