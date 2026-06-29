import { z } from "zod";

export const getHistorySchema = z.object({
  page: z.coerce
    .number({
      error: "pageは数値で入力してください",
    })
    .int({
      error: "pageは整数で入力してください",
    })
    .min(1, {
      error: "pageは1以上を指定してください",
    })
    .default(1),

  limit: z.coerce
    .number({
      error: "limitは数値で入力してください",
    })
    .int({
      error: "limitは整数で入力してください",
    })
    .min(1, {
      error: "limitは1以上を指定してください",
    })
    .max(100, {
      error: "limitは100以下を指定してください",
    })
    .default(20),
});

export const userIdSchema = z.object({
  id: z.coerce
    .number({
      error: "UserIDは数値で入力してください",
    })
    .int({
      error: "UserIDは整数で入力してください",
    })
    .positive({
      error: "UserIDは1以上を指定してください",
    }),
});

export const projectIdSchema = z.object({
  id: z.coerce
    .number({
      error: "ProjectIDは数値で入力してください",
    })
    .int({
      error: "ProjectIDは整数で入力してください",
    })
    .positive({
      error: "ProjectIDは1以上を指定してください",
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
      error: "CommentIDは数値で入力してください",
    })
    .int({
      error: "CommentIDは整数で入力してください",
    })
    .positive({
      error: "CommentIDは1以上を指定してください",
    }),
});
