import { Prisma } from "@prisma/client";
import { ISSUE_INCLUDE_MAP } from "../../constants/issue.constants.js";
import { validateIssueIncludes } from "../../validators/issue-include.validator.js";
import { parseInclude } from "../../utils/include-parser.js";

/**
 * 指定されたinclude項目からPrisma Issue Include設定を生成する
 */
export const buildIssueInclude = (
  include?: string,
  allowComments = false,
): Prisma.IssueInclude => {
  const includes = parseInclude(include);

  validateIssueIncludes(includes, allowComments);

  const result: Prisma.IssueInclude = {};

  for (const field of includes) {
    result[field] = ISSUE_INCLUDE_MAP[field];
  }

  return result;
};
