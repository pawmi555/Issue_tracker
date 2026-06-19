import { Prisma } from "@prisma/client";
import { IssueIncludeField } from "../../types/issue.types.js";
import { ISSUE_INCLUDE_MAP } from "../../constants/issue.constants.js";

/**
 * 指定されたinclude項目からPrisma Issue Include設定を生成する
 */
export const buildIssueInclude = (
  includes: IssueIncludeField[],
): Prisma.IssueInclude => {
  const include: Prisma.IssueInclude = {};

  for (const field of includes) {
    include[field] = ISSUE_INCLUDE_MAP[field];
  }

  return include;
};
