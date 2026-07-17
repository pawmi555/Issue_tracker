import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, {
      error: "コメントを入力してください",
    })
    .max(1000, {
      error: "コメントは1000文字以内で入力してください",
    }),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
