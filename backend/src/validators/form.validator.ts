import { z } from "zod";

const questionSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "Question label is required")
      .max(300, "Question label cannot exceed 300 characters"),

    type: z.enum([
      "short_text",
      "long_text",
      "single_choice",
      "multiple_choice",
      "rating",
    ]),

    options: z.array(z.string().trim().min(1)).max(20).default([]),

    required: z.boolean().default(false),

    order: z.number().int().min(0),
  })
  .strict()
  .superRefine((question, ctx) => {
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
  });

const titleSchema = z
  .string()
  .trim()
  .min(3, "Form title must be at least 3 characters")
  .max(120, "Form title cannot exceed 120 characters");

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "Description cannot exceed 500 characters");

const questionsSchema = z.array(questionSchema).max(50);

const statusSchema = z.enum(["draft", "published"]);

const createFormFieldsSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema.default(""),
    questions: questionsSchema.default([]),
    status: statusSchema.default("draft"),
  })
  .strict();

const updateFormFieldsSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    questions: questionsSchema,
    status: statusSchema,
  })
  .partial()
  .strict();

export const createFormSchema = createFormFieldsSchema.superRefine(
  (form, ctx) => {
    const orders = form.questions.map((question) => question.order);

    if (new Set(orders).size !== orders.length) {
      ctx.addIssue({
        code: "custom",
        path: ["questions"],
        message: "Question order values must be unique",
      });
    }
  },
);

export const updateFormSchema = updateFormFieldsSchema
  .refine(
    (form) => Object.keys(form).length > 0,
    "At least one field must be provided",
  )
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
    }
  });

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
