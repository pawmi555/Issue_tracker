import type { Prisma } from "@prisma/client";

import type { IssueSummaryDto } from "../../dto/issue/issue-summary.dto.js";
import type { issueSummaryWithRelationSelect } from "../../selects/issue.select.js";

export type IssueSummaryWithRelationMapperInput = Prisma.IssueGetPayload<{
  select: typeof issueSummaryWithRelationSelect;
}>;

/**
 * Include付きIssue一覧用Mapper
 */
export const mapIssueSummaryWithRelation = (
  issue: IssueSummaryWithRelationMapperInput,
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

    ...(issue.assignee && {
      assignee: {
        id: issue.assignee.id,
        name: issue.assignee.name,
      },
    }),

    ...(issue.reporter && {
      reporter: {
        id: issue.reporter.id,
        name: issue.reporter.name,
      },
    }),

    ...(issue.project && {
      project: {
        id: issue.project.id,
        name: issue.project.name,
      },
    }),
  };
};
