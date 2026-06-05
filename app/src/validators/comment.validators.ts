import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
