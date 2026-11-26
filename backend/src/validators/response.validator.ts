import { z } from "zod";

const answerSchema = z
  .object({
    questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID"),
    value: z.union([
      z.string().max(5000),
      z.array(z.string().min(1).max(300)).max(20),
      z.number().int().min(1).max(5),
    ]),
  })
  .strict();

export const submitResponseSchema = z
  .object({
    answers: z
      .array(answerSchema)
      .min(1, "At least one answer is required")
      .max(50),
  })
  .strict()
  .superRefine((response, ctx) => {
    const questionIds = response.answers.map((answer) => answer.questionId);

    if (new Set(questionIds).size !== questionIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["answers"],
        message: "Duplicate question answers are not allowed",
      });
    }
  });

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
