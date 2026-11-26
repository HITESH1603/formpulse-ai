
import { z } from "zod";

const questionFields = {
  label: z.string().trim().min(1, "Question label is required").max(300, "Question label cannot exceed 300 characters"),
  type: z.enum(["short_text", "long_text", "single_choice", "multiple_choice", "rating"]),
  options: z.array(z.string().trim().min(1)).max(20).default([]),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
};

const validateQuestion = (
  question: { type: string; options: string[] },
  ctx: z.RefinementCtx,
) => {
  const isChoiceQuestion =
    question.type === "single_choice" || question.type === "multiple_choice";

  if (isChoiceQuestion && question.options.length < 2) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "Choice questions must have at least 2 options",
    });
  }

  if (!isChoiceQuestion && question.options.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "Only choice questions can have options",
    });
  }

  if (new Set(question.options).size !== question.options.length) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "Question options must be unique",
    });
  }
};

const newQuestionSchema = z.object(questionFields).strict().superRefine(validateQuestion);

const updateQuestionSchema = z.object({
  ...questionFields,
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID").optional(),
}).strict().superRefine(validateQuestion);

const titleSchema = z.string().trim().min(3, "Form title must be at least 3 characters").max(120, "Form title cannot exceed 120 characters");
const descriptionSchema = z.string().trim().max(500, "Description cannot exceed 500 characters");
const questionsSchema = z.array(newQuestionSchema).max(50);
const updateQuestionsSchema = z.array(updateQuestionSchema).max(50);

const createFormFieldsSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.default(""),
  questions: questionsSchema.default([]),
}).strict();

const updateFormFieldsSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  questions: updateQuestionsSchema,
}).partial().strict();

export const createFormSchema = createFormFieldsSchema.superRefine((form, ctx) => {
  const orders = form.questions.map((question) => question.order);

  if (new Set(orders).size !== orders.length) {
    ctx.addIssue({
      code: "custom",
      path: ["questions"],
      message: "Question order values must be unique",
    });
  }
});

export const updateFormSchema = updateFormFieldsSchema
  .refine((form) => Object.keys(form).length > 0, "At least one field must be provided")
  .superRefine((form, ctx) => {
    if (form.questions) {
      const orders = form.questions.map((question) => question.order);

      if (new Set(orders).size !== orders.length) {
        ctx.addIssue({
          code: "custom",
          path: ["questions"],
          message: "Question order values must be unique",
        });
      }

      const ids = form.questions
        .map((question) => question.id)
        .filter((id) => id !== undefined);

      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({
          code: "custom",
          path: ["questions"],
          message: "Question IDs must be unique",
        });
      }
    }
  });

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
