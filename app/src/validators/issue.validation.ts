import { z } from "zod";

import { AppError } from "../utils/app-error.js";

const sortFields = ["createdAt", "dueDate"] as const;

const orderFields = ["asc", "desc"] as const;

export const createIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, {
      error: "タイトルを入力してください",
    })
    .max(255, {
      error: "タイトルは255文字以内で入力してください",
    }),

  description: z
    .string()
    .trim()
    .max(5000, {
      error: "説明は5000文字以内で入力してください",
    })
    .optional(),

  priorityId: z
    .number({
      error: "優先度IDは数値で入力してください",
    })
    .int({
      error: "優先度IDは整数で指定してください",
    })
    .positive({
      error: "優先度を選択してください",
    }),

  assigneeId: z
    .number({
      error: "担当者IDは数値で入力してください",
    })
    .int({
      error: "担当者IDは整数で指定してください",
    })
    .positive({
      error: "担当者IDは1以上で指定してください",
    })
    .optional(),

  dueDate: z.iso
    .datetime({
      error: "期限日はISO-8601形式で入力してください",
    })
    .transform((v) => new Date(v))
    .optional(),
});

export const getIssuesQuerySchema = z.object({
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
    .max(100, {
      error: "取得件数は100件以下で指定してください",
    })
    .default(20),

  statusId: z.coerce
    .number({
      error: "ステータスIDは数値で入力してください",
    })
    .int({
      error: "ステータスIDは整数で入力してください",
    })
    .positive({
      error: "ステータスIDは1以上を指定してください",
    })
    .optional(),

  priorityId: z.coerce
    .number({
      error: "優先度IDは数値で入力してください",
    })
    .int({
      error: "優先度IDは整数で入力してください",
    })
    .positive({
      error: "優先度IDは1以上を指定してください",
    })
    .optional(),

  assigneeId: z.coerce
    .number({
      error: "担当者IDは数値で入力してください",
    })
    .int({
      error: "担当者IDは整数で入力してください",
    })
    .positive({
      error: "担当者IDは1以上を指定してください",
    })
    .optional(),

  keyword: z
    .string()
    .max(100, {
      error: "検索キーワードは100文字以内で入力してください",
    })
    .optional(),

  sort: z
    .enum(sortFields, {
      error: "並び替え項目が不正です",
    })
    .default("createdAt"),

  order: z
    .enum(orderFields, {
      error: "並び順が不正です",
    })
    .default("desc"),

  include: z
    .string({
      error: "includeは文字列で指定してください",
    })
    .trim()
    .max(100, {
      error: "includeは100文字以内で指定してください",
    })
    .optional(),

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

export const getIssueDetailQuerySchema = z.object({
  include: z
    .string({
      error: "includeは文字列で指定してください",
    })
    .trim()
    .max(100, {
      error: "includeは100文字以内で指定してください",
    })
    .optional(),

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

export const updateIssueBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, {
        error: "タイトルを入力してください",
      })
      .max(255, {
        error: "タイトルは255文字以内で入力してください",
      })
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000, {
        error: "説明は5000文字以内で入力してください",
      })
      .nullable()
      .optional(),

    statusId: z
      .number({
        error: "ステータスIDは数値で入力してください",
      })
      .int({
        error: "ステータスIDは整数で指定してください",
      })
      .positive({
        error: "ステータスを選択してください",
      })
      .optional(),

    priorityId: z
      .number({
        error: "優先度IDは数値で入力してください",
      })
      .int({
        error: "優先度IDは整数で指定してください",
      })
      .positive({
        error: "優先度を選択してください",
      })
      .optional(),

    assigneeId: z
      .number({
        error: "担当者IDは数値で入力してください",
      })
      .int({
        error: "担当者IDは整数で指定してください",
      })
      .positive({
        error: "担当者IDは1以上を指定してください",
      })
      .nullable()
      .optional(),

    dueDate: z.iso
      .datetime({
        error: "期限日はISO-8601形式で入力してください",
      })
      .transform((v) => new Date(v))
      .nullable()
      .optional(),
  })
  .strict();

export const updateIssueSchema = updateIssueBodySchema.refine(
  (data) =>
    data.title !== undefined ||
    data.description !== undefined ||
    data.statusId !== undefined ||
    data.priorityId !== undefined ||
    data.assigneeId !== undefined ||
    data.dueDate !== undefined,
  {
    error: "更新項目を1つ以上指定してください",
  },
);

export const projectIdSchema = z.object({
  projectId: z.coerce
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

type IssueStatusId = 1 | 2 | 3 | 4 | 5;

export const isIssueStatusId = (value: number): value is IssueStatusId => {
  return [1, 2, 3, 4, 5].includes(value);
};

export const validateIssueTransition = (
  current: IssueStatusId,
  next: IssueStatusId,
) => {
  const allowed: Record<IssueStatusId, IssueStatusId[]> = {
    1: [2],
    2: [3],
    3: [4],
    4: [5],
    5: [],
  };

  if (!allowed[current]?.includes(next)) {
    throw new AppError("invalid transition", 409, "ISSUE_INVALID_TRANSITION");
  }
};
