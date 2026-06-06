import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "content is required")
    .max(1000, "content must be 1000 characters or less"),
});

export const getCommentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
