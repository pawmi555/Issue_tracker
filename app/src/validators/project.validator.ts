import { z } from "zod";
import { PROJECT_ROLES } from "../constants/project.constants.js";

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
});

const updateProjectBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "プロジェクト名を入力してください",
    })
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, {
      error: "説明は1000文字以内で入力してください",
    })
    .optional(),
});

export const updateProjectSchema = updateProjectBodySchema.refine(
  (data) => {
    return data.name !== undefined || data.description !== undefined;
  },
  {
    error: "更新項目を1つ以上指定してください",
  },
);

export const addMemberSchema = z.object({
  userId: z
    .number({
      error: "ユーザーIDは数値で入力してください",
    })
    .int({
      error: "ユーザーIDは整数で指定してください",
    })
    .positive({
      error: "ユーザーを選択してください",
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
