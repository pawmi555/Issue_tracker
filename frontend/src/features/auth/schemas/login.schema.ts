import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({
    error: "メール形式が不正です",
  }),

  password: z.string().min(8, {
    error: "パスワードは8文字以上入力してください",
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
