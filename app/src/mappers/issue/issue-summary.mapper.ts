import type { Prisma } from "@prisma/client";

import type { IssueSummaryDto } from "../../dto/issue/issue-summary.dto.js";
import type { issueSummarySelect } from "../../selects/issue.select.js";

export type IssueSummaryMapperInput = Prisma.IssueGetPayload<{
  select: typeof issueSummarySelect;
}>;

/**
 * Issue → IssueSummaryDto
 *
 * 通常一覧用
 */
export const mapIssueSummary = (
  issue: IssueSummaryMapperInput,
  options?: {
    includeDeleted?: boolean;
  },
): IssueSummaryDto => {
  return {
    id: issue.id,

    title: issue.title,

    dueDate: issue.dueDate,

    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,

    ...(options?.includeDeleted && {
      deletedAt: issue.deletedAt,
    }),
  };
};
