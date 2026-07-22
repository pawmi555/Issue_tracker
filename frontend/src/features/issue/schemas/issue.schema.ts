import { z } from "zod";

export const issueFormSchema = z.object({
  title: z
    .string()
    .max(255, {
      error: "タイトルは255文字以内で入力してください",
    })
    .trim()
    .min(1, {
      error: "タイトルを入力してください",
    }),

  description: z
    .string()
    .max(5000, {
      error: "説明は5000文字以内で入力してください",
    })
    .trim(),

  priorityId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce
      .number({
        error: "優先度を選択してください",
      })
      .int({
        error: "優先度を選択してください",
      })
      .positive({
        error: "優先度を選択してください",
      }),
  ),

  assigneeId: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),

  dueDate: z.string(),
});

export type IssueFormInput = z.input<typeof issueFormSchema>;

export type IssueFormValues = z.infer<typeof issueFormSchema>;
