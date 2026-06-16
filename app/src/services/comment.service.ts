import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { buildPagination } from "../utils/pagination.js";
import { requireRole } from "../middlewares/requireRoleMiddleware.js";
import { checkProjectRole } from "../utils/role-check.js";
import { buildCommentHistories } from "../utils/history.utils.js";

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

export type UpdateCommentInput = {
  commentId: number;
  userId: number;

  data: {
    content: string;
  };
};

export type DeleteCommentInput = {
  commentId: number;
  userId: number;
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

/**
 * Comment更新
 */
export const updateCommentService = async ({
  commentId,
  userId,
  data,
}: UpdateCommentInput) => {
  // レスポンス定義
  const commentResponseSelect = {
    userId: true,
    content: true,
    updatedAt: true,
    issue: {
      select: {
        projectId: true,
      },
    },
  } satisfies Prisma.CommentSelect;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const HISTORY_ACTION_UPDATE = 1;

    // コメント存在確認
    const comment = await tx.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
      select: commentResponseSelect,
    });

    if (!comment) {
      throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    // Project参加確認
    const member = await tx.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: comment.issue.projectId,
          userId,
        },
      },

      include: {
        role: true,
      },
    });

    if (!member) {
      throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
    }

    // コメント更新権限確認
    const isOwner = comment.userId === userId;

    const hasManagerRole = checkProjectRole({
      memberRole: member.role.name,
      allowedRoles: ["OWNER", "MANAGER"],
    });

    const canUpdate = isOwner || hasManagerRole;
    console.log({
      commentUserId: comment.userId,
      requestUserId: userId,
    });
    console.log({
      memberRole: member.role.name,
    });

    if (!canUpdate) {
      throw new AppError("comment forbidden", 403, "COMMENT_FORBIDDEN");
    }

    // 履歴生成（メモリ）
    const histories = buildCommentHistories({
      before: {
        content: comment.content,
      },
      after: data,
      commentId,
      userId,
      actionId: HISTORY_ACTION_UPDATE,
    });

    // 差分なし
    if (histories.length === 0) {
      return comment;
    }

    const updatedComment = await tx.comment.update({
      where: {
        id: commentId,
      },
      data,
      select: commentResponseSelect,
    });

    await tx.commentHistory.createMany({
      data: histories,
    });

    return updatedComment;
  });
};

/**
 * Comment削除
 */
export const deleteCommentService = async ({
  commentId,
  userId,
}: DeleteCommentInput) => {
  // Comment存在確認
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
    },
    include: {
      issue: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }

  // 削除済みProjectは操作不可
  if (comment.issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // Project参加確認
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: comment.issue.projectId,
        userId,
      },
    },
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  // 削除権限確認

  const isAuthor = comment.userId === userId;
  const canDelete = requireRole("MANAGER");

  if (!isAuthor && !canDelete) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  // Commentソフトデリート実行
  const deletedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return deletedComment;
};
