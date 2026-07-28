import { z } from "zod";

import { PROJECT_ROLES } from "../constants/project.constants.js";

const sortFields = ["createdAt", "dueDate"] as const;

const orderFields = ["asc", "desc"] as const;

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

export const userIdSchema = z.object({
  userId: z.coerce
    .number({
      error: "userIdは数値で入力してください",
    })
    .int({
      error: "userIdは整数で入力してください",
    })
    .positive({
      error: "userIdは1以上を指定してください",
    }),
});

export const projectMemberSchema = projectIdSchema.extend(userIdSchema.shape);

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "プロジェクト名を入力してください",
    })
    .max(100, {
      error: "プロジェクト名は100文字以内で入力してください",
    }),

  description: z
    .string()
    .trim()
    .max(1000, {
      error: "説明は1000文字以内で入力してください",
    })
    .optional(),
});

export const getProjectsSchema = z.object({
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

  include: z.string().optional(),

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

export const getProjectDetailSchema = z.object({
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

const updateProjectBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, {
        error: "プロジェクト名を入力してください",
      })
      .max(100, {
        error: "プロジェクト名は100文字以内で入力してください",
      })
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, {
        error: "説明は1000文字以内で入力してください",
      })
      .optional(),
  })
  .strict();

export const updateProjectSchema = updateProjectBodySchema.refine(
  (data) => data.name !== undefined || data.description !== undefined,
  {
    error: "更新項目を1つ以上指定してください",
  },
);

export const addMemberSchema = z.object({
  userId: z.coerce
    .number({
      error: "userIdは数値で入力してください",
    })
    .int({
      error: "userIdは整数で入力してください",
    })
    .positive({
      error: "userIdは1以上を指定してください",
    }),

  role: z.enum(PROJECT_ROLES, {
    error: "ロールが不正です",
  }),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(PROJECT_ROLES, {
    error: "ロールが不正です",
  }),
});
