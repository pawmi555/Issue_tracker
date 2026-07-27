import { prisma } from "../lib/prisma.js";

import type { Prisma } from "@prisma/client";

import { AppError } from "../utils/app-error.js";
import { buildPagination } from "../utils/pagination.js";
import { buildPaginationMeta } from "../utils/pagination-meta.js";
import { buildCommentHistories } from "../utils/history.utils.js";
import { isProjectRoleName, assertProjectRole } from "../utils/role-check.js";
import { mapComment } from "../mappers/comment/comment.mapper.js";
import {
  commentDtoSelect,
  commentHistorySelect,
} from "../selects/comment.select.js";

type CreateCommentInput = {
  issueId: number;
  userId: number;
  content: string;
};

type GetCommentsInput = {
  issueId: number;
  userId: number;
  includeDeleted?: boolean;

  query: {
    page: number;
    limit: number;
  };
};

type UpdateCommentInput = {
  commentId: number;
  userId: number;

  data: {
    content: string;
  };
};

type DeleteCommentInput = {
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
      project: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
      projectId: true,
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

  const roleName = member.role.name;

  if (!isProjectRoleName(roleName)) {
    throw new AppError("invalid role", 500, "INVALID_ROLE");
  }

  assertProjectRole({
    memberRole: roleName,
    minimumRole: "MEMBER",
  });

  const comment = await prisma.comment.create({
    data: {
      issueId,
      userId,
      content,
    },

    select: commentDtoSelect,
  });

  return mapComment(comment);
};

/**
 * Comment一覧取得
 */
export const getCommentsService = async ({
  issueId,
  userId,
  query,
  includeDeleted = false,
}: GetCommentsInput) => {
  // issue存在確認
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,

      ...(!includeDeleted && {
        deletedAt: null,
      }),
    },

    include: {
      project: true,
    },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404, "ISSUE_NOT_FOUND");
  }

  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // Project参加確認
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: issue.projectId,
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

  const roleName = member.role.name;

  if (!isProjectRoleName(roleName)) {
    throw new AppError("invalid role", 500, "INVALID_ROLE");
  }

  if (includeDeleted) {
    assertProjectRole({
      memberRole: roleName,
      minimumRole: "MANAGER",
    });
  }

  // ページネーション設定
  const { page, limit, skip, take } = buildPagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.CommentWhereInput = {
    issueId,

    ...(!includeDeleted && {
      deletedAt: null,
    }),
  };

  const [comments, total] = await Promise.all([
    // コメント取得
    prisma.comment.findMany({
      where,
      skip,
      take,

      orderBy: {
        createdAt: "asc",
      },

      select: commentDtoSelect,
    }),

    // コメントカウント
    prisma.comment.count({
      where,
    }),
  ]);

  return {
    data: comments.map((comment) =>
      mapComment(comment, {
        includeDeleted,
      }),
    ),
    meta: buildPaginationMeta({
      page,
      limit,
      total,
    }),
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
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const HISTORY_ACTION_UPDATE = 1;

    // コメント存在確認
    const comment = await tx.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
      select: commentHistorySelect,
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
    const roleName = member.role.name;

    if (!isProjectRoleName(roleName)) {
      throw new AppError("invalid role", 500, "INVALID_ROLE");
    }

    const isAuthor = comment.userId === userId;

    if (!isAuthor) {
      assertProjectRole({
        memberRole: roleName,
        minimumRole: "MANAGER",
      });
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
      const currentComment = await tx.comment.findUniqueOrThrow({
        where: {
          id: commentId,
        },
        select: commentDtoSelect,
      });

      return mapComment(currentComment);
    }

    const updatedComment = await tx.comment.update({
      where: {
        id: commentId,
      },
      data,
      select: commentDtoSelect,
    });

    await tx.commentHistory.createMany({
      data: histories,
    });

    return mapComment(updatedComment);
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
  const roleName = member.role.name;

  if (!isProjectRoleName(roleName)) {
    throw new AppError("invalid role", 500, "INVALID_ROLE");
  }

  const isAuthor = comment.userId === userId;

  if (!isAuthor) {
    assertProjectRole({
      memberRole: roleName,
      minimumRole: "MANAGER",
    });
  }

  // Commentソフトデリート実行
  const deletedComment = await prisma.comment.updateMany({
    where: {
      id: commentId,
      deletedAt: null,
    },

    data: {
      deletedAt: new Date(),
    },
  });

  if (deletedComment.count === 0) {
    throw new AppError("comment not found", 404, "COMMENT_NOT_FOUND");
  }

  return;
};
