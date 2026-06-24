import { z } from "zod";

export const authRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "名前を入力してください",
    })
    .max(50, {
      error: "名前は50文字以内で入力してください",
    }),

  email: z.email({
    error: "メール形式が不正です",
  }),

  password: z.string().min(8, {
    error: "パスワードは8文字以上入力してください",
  }),
});

export const authLoginSchema = z.object({
  email: z.email({
    error: "メール形式が不正です",
  }),

  password: z.string().min(8, {
    error: "パスワードは8文字以上入力してください",
  }),
});
