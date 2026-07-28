import { z } from "zod";

export const projectFormSchema = z.object({
  name: z
    .string()
    .max(100, {
      error: "プロジェクト名は100文字以内で入力してください",
    })
    .trim()
    .min(1, {
      error: "プロジェクト名を入力してください",
    }),

  description: z
    .string()
    .max(1000, {
      error: "説明は1000文字以内で入力してください",
    })
    .trim(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
