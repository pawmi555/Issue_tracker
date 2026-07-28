import type { Prisma } from "@prisma/client";

/**
 * User詳細・更新用
 */
export const userDtoSelect = {
  id: true,
  name: true,
  email: true,

  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  role: {
    select: {
      id: true,
      name: true,
      label: true,
    },
  },
} satisfies Prisma.UserSelect;

/**
 * User一覧用
 */
export const userSummarySelect = {
  id: true,
  name: true,

  deletedAt: true,
} satisfies Prisma.UserSelect;

/**
 * User履歴比較用
 */
export const userHistorySelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,

  role: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.UserSelect;
