import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

export type CreateCommentInput = {
  issueId: number;
  userId: number;
  content: string;
};

/**
 * Comment作成
 */
export const createCommentService = async ({
  issueId,
  userId,
  content,
}: CreateCommentInput) => {
  // issue存在確認
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
    },
    include: {
      project: true,
    },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404, "ISSUE_NOT_FOUND");
  }

  // Project参加確認
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

  const comment = await prisma.comment.create({
    data: {
      issueId,
      userId,
      content,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return comment;
};
