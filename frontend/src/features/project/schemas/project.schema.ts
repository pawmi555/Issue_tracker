import { z } from "zod";

export const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "プロジェクト名を入力してください",
    })
    .max(100, {
      error: "プロジェクト名は100文字以内で入力してください",
    }),

  description: z.string().trim().max(1000, {
    error: "説明は1000文字以内で入力してください",
  }),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
