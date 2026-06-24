import { z } from "zod";

export const getUsersSchema = z.object({
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

const updateUserBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, {
        error: "名前を入力してください",
      })
      .optional(),

    email: z
      .email({
        error: "メール形式が不正です",
      })
      .optional(),

    roleId: z
      .number({
        error: "ロールIDは数値で入力してください",
      })
      .int({
        error: "ロールIDは整数で指定してください",
      })
      .positive({
        error: "ロールIDは1以上を指定してください",
      })
      .optional(),
  })
  .strict();

export const updateUserSchema = updateUserBodySchema.refine(
  (data) =>
    data.name !== undefined ||
    data.email !== undefined ||
    data.roleId !== undefined,
  {
    error: "更新項目を1つ以上指定してください",
  },
);

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
