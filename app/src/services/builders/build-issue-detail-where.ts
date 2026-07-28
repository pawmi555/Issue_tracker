import type { Prisma } from "@prisma/client";

type BuildIssueDetailWhereInput = {
  issueId: number;
  includeDeleted: boolean;
};

export const buildIssueDetailWhere = ({
  issueId,
  includeDeleted,
}: BuildIssueDetailWhereInput): Prisma.IssueWhereInput => {
  return {
    id: issueId,

    ...(!includeDeleted && {
      deletedAt: null,
    }),
  };
};
