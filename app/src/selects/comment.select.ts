import type { Prisma } from "@prisma/client";

/**
 * Comment詳細・作成・更新用
 */
export const commentDtoSelect = {
  id: true,
  content: true,

  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  user: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.CommentSelect;

/**
 * Comment一覧用
 */
export const commentSummarySelect = {
  id: true,
  content: true,

  createdAt: true,
  updatedAt: true,

  user: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.CommentSelect;

/**
 * Comment履歴比較用
 */
export const commentHistorySelect = {
  id: true,
  userId: true,
  content: true,

  issue: {
    select: {
      projectId: true,
    },
  },
} satisfies Prisma.CommentSelect;
