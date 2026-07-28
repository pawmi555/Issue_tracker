import type { Prisma } from "@prisma/client";
import type { GetIssuesInput } from "../../types/issue.types.js";

type BuildIssueWhereInput = Pick<GetIssuesInput, "projectId"> & {
  query: GetIssuesInput["query"];
};

export const buildIssueWhere = (
  input: BuildIssueWhereInput,
  includeDeleted: boolean,
): Prisma.IssueWhereInput => {
  return {
    projectId: input.projectId,

    ...(!includeDeleted && {
      deletedAt: null,
    }),

    ...(input.query.statusId !== undefined && {
      statusId: input.query.statusId,
    }),

    ...(input.query.priorityId !== undefined && {
      priorityId: input.query.priorityId,
    }),

    ...(input.query.assigneeId !== undefined && {
      assigneeId: input.query.assigneeId,
    }),

    ...(input.query.keyword && {
      OR: [
        {
          title: {
            contains: input.query.keyword,
            mode: "insensitive",
          },
        },

        {
          description: {
            contains: input.query.keyword,
            mode: "insensitive",
          },
        },
      ],
    }),
  };
};
