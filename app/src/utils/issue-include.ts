import { AppError } from "./app-error.js";
import { Prisma } from "@prisma/client";

export const ISSUE_INCLUDE_FIELDS = [
  "assignee",
  "reporter",
  "comments",
] as const;

// Union型生成
export type IssueIncludeField = (typeof ISSUE_INCLUDE_FIELDS)[number];

// 型ガード関数
export const isIssueIncludeField = (
  value: string,
): value is IssueIncludeField => {
  return ISSUE_INCLUDE_FIELDS.includes(value as IssueIncludeField);
};

// Prisma Include生成
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
