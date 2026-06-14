import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import { buildPagination } from "../utils/pagination.js";
import { mapIssueHistory } from "../mappers/history.mapper.js";
import type { GetHistoryQuery } from "../validators/history.validators.js";

type GetHistoryInput = {
  issueId: number;
  userId: number;
  query: GetHistoryQuery;
};

export const getHistory = async ({
  issueId,
  userId,
  query,
}: GetHistoryInput) => {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
    select: {
      projectId: true,
    },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404, "ISSUE_NOT_FOUND");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: issue.projectId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  const pagination = buildPagination(query);

  const [histories, total] = await Promise.all([
    prisma.issueHistory.findMany({
      where: {
        issueId,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip: pagination.skip,
      take: pagination.take,

      include: {
        action: {
          select: {
            name: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.issueHistory.count({
      where: {
        issueId,
      },
    }),
  ]);

  const data = await Promise.all(histories.map(mapIssueHistory));

  return {
    data,

    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  };
};
