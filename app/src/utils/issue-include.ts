import { AppError } from "./app-error.js";
import { Prisma } from "@prisma/client";

const ISSUE_INCLUDE_FIELDS = ["assignee", "reporter", "comments"] as const;

// Prisma Include生成
export const buildIssueInclude = (includes: string[]): Prisma.IssueInclude => {
  const include: Prisma.IssueInclude = {};

  if (includes.includes("assignee")) {
    include.assignee = true;
  }

  if (includes.includes("reporter")) {
    include.reporter = true;
  }

  if (includes.includes("comments")) {
    include.comments = true;
  }

  return include;
};

export const parseInclude = (include?: string): string[] => {
  if (!include) {
    return [];
  }

  return include
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
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
