import { AppError } from "../utils/app-error.js";
import { IssueIncludeField } from "../types/issue.types.js";
import { ISSUE_INCLUDE_FIELDS } from "../constants/issue.constants.js";

/**
 * 指定された文字列がIssueIncludeFieldに含まれるか判定する型ガード関数
 */
export const isIssueIncludeField = (
  value: string,
): value is IssueIncludeField => {
  return ISSUE_INCLUDE_FIELDS.includes(value as IssueIncludeField);
};

/**
 * includeパラメータの件数と値を検証する
 *
 * @throws AppError
 */
export function validateIssueIncludes(
  includes: readonly string[],
  allowComments: boolean,
): asserts includes is IssueIncludeField[] {
  if (includes.length > 6) {
    throw new AppError("include limit exceeded", 422, "INCLUDE_LIMIT_EXCEEDED");
  }

  if (!allowComments && includes.includes("comments")) {
    throw new AppError("comments not allowed", 422, "VALIDATION_ERROR");
  }

  if (new Set(includes).size !== includes.length) {
    throw new AppError("duplicate include", 422, "VALIDATION_ERROR");
  }

  for (const include of includes) {
    if (!isIssueIncludeField(include)) {
      throw new AppError("invalid include", 422, "INVALID_INCLUDE");
    }
  }
}
