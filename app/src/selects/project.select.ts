import { Prisma } from "@prisma/client";

/**
 * Project詳細・作成・更新用
 * ProjectDto
 */
export const projectDtoSelect = {
  id: true,
  ownerId: true,

  name: true,
  description: true,

  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  owner: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },

  members: {
    select: {
      id: true,

      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      role: {
        select: {
          id: true,
          name: true,
          label: true,
        },
      },
    },
  },

  _count: {
    select: {
      members: true,
      issues: true,
    },
  },
} satisfies Prisma.ProjectSelect;

/**
 * Project一覧用
 * ProjectSummaryDto
 */
export const projectSummarySelect = {
  id: true,
  name: true,
  description: true,

  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  owner: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },

  _count: {
    select: {
      members: true,
      issues: true,
    },
  },
} satisfies Prisma.ProjectSelect;

/**
 * Project履歴比較用
 */
export const projectHistorySelect = {
  id: true,
  name: true,
  description: true,
} satisfies Prisma.ProjectSelect;
