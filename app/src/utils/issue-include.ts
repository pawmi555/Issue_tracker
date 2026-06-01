import { AppError } from "./app-error.js";
import { Prisma } from "@prisma/client";

/**
 * Issue取得時に指定可能なinclude項目一覧
 */
export const ISSUE_INCLUDE_FIELDS = [
  "assignee",
  "reporter",
  "comments",
] as const;

/**
 * 利用可能なIssue include項目を表すUnion型
 */
export type IssueIncludeField = (typeof ISSUE_INCLUDE_FIELDS)[number];

/**
 * 指定された文字列がIssueIncludeFieldに含まれるか判定する型ガード関数
 */
export const isIssueIncludeField = (
  value: string,
): value is IssueIncludeField => {
  return ISSUE_INCLUDE_FIELDS.includes(value as IssueIncludeField);
};

/**
 * 指定されたinclude項目からPrismaのInclude設定を生成する
 */
export const buildIssueInclude = (
  includes: IssueIncludeField[],
): Prisma.IssueInclude => {
  const include: Prisma.IssueInclude = {};

  if (includes.includes("assignee")) {
    include.assignee = {
      select: {
        id: true,
        name: true,
      },
    };
  }

  if (includes.includes("reporter")) {
    include.reporter = {
      select: {
        id: true,
        name: true,
      },
    };
  }

  if (includes.includes("comments")) {
    include.comments = {
      where: {
        deletedAt: null,
      },

      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    };
  }

  return include;
};

/**
 * includeパラメータの件数と値を検証する
 *
 * @throws AppError
 */
export const validateIssueIncludes = (includes: string[]) => {
  if (includes.length > 3) {
    throw new AppError("include limit exceeded", 400, "INCLUDE_LIMIT_EXCEEDED");
  }

  for (const include of includes) {
    if (!ISSUE_INCLUDE_FIELDS.includes(include as IssueIncludeField)) {
      throw new AppError("invalid include", 400, "INVALID_INCLUDE");
    }
  }
};
