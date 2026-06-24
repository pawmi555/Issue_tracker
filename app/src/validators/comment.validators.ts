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
      error: "取得件数は1000件以下で指定してください",
    })
    .default(20),

  includeDeleted: z
    .preprocess(
      (value) => {
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
      },
      z.boolean({
        error: "includeDeletedはtrueまたはfalseを指定してください",
      }),
    )
    .default(false),
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

export const issueIdSchema = z.object({
  id: z.coerce
    .number({
      error: "IssueIDは数値で入力してください",
    })
    .int({
      error: "IssueIDは整数で入力してください",
    })
    .positive({
      error: "IssueIDは1以上を指定してください",
    }),
});

export const commentIdSchema = z.object({
  id: z.coerce
    .number({
      error: "commentIDは数値で入力してください",
    })
    .int({
      error: "commentIDは整数で入力してください",
    })
    .positive({
      error: "commentIDは1以上を指定してください",
    }),
});

export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>;
