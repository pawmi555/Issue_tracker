import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { buildPagination } from "../utils/pagination.js";

export type CreateCommentInput = {
  issueId: number;
  userId: number;
  content: string;
};

export type GetCommentsInput = {
  issueId: number;
  userId: number;

  query: {
    page: number;
    limit: number;
  };
};

/**
 * Comment作成
 */
export const createCommentsService = async ({
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

/**
 * Comment一覧取得
 */
export const getCommentsService = async ({
  issueId,
  userId,
  query,
}: GetCommentsInput) => {
  // issue存在確認
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
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

  // ページネーション設定
  const pagination = buildPagination({
    page: query.page,
    limit: query.limit,
  });

  const [comments, total] = await Promise.all([
    // コメント取得
    prisma.comment.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      skip: pagination.skip,
      take: pagination.take,

      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    // コメントカウント
    prisma.comment.count({
      where: {
        issueId,
        deletedAt: null,
      },
    }),
  ]);

  return {
    data: comments,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  };
};
