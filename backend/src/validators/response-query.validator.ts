import { z } from "zod";

export const responseQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

export type ResponseQueryInput = z.infer<typeof responseQuerySchema>;
