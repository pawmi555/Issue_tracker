import { z } from "zod";

export const issueFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, {
      error: "タイトルを入力してください",
    })
    .max(255, {
      error: "タイトルは255文字以内で入力してください",
    }),

  description: z.string().trim().max(5000, {
    error: "説明は5000文字以内で入力してください",
  }),

  priorityId: z.coerce.number().int().positive({
    error: "優先度を選択してください",
  }),

  assigneeId: z.union([z.literal(""), z.coerce.number().int().positive()]),

  dueDate: z.string(),
});

export type IssueFormInput = z.input<typeof issueFormSchema>;

export type IssueFormValues = z.infer<typeof issueFormSchema>;
