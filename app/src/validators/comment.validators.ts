import { z } from "zod";

export const createCommentSchema = z.object({
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

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;

export const getCommentsSchema = z.object({
  page: z.coerce
    .number({
      error: "ページ番号は数値で入力してください",
    })
    .int({
      error: "ページ番号は整数で入力してください",
    })
    .min(1, {
      error: "ページ番号は1以上を指定してください",
    })
    .default(1),
  limit: z.coerce
    .number({
      error: "取得件数は数値で入力してください",
    })
    .int({
      error: "取得件数は整数で入力してください",
    })
    .min(1, {
      error: "取得件数は1以上を指定してください",
    })
    .max(1000, {
      error: "取得件数は100件以下で指定してください",
    })
    .default(20),
});

export const updateCommentSchema = z.object({
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

export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>;
