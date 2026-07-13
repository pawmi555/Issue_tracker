import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

import { buildPagination } from "../utils/pagination.js";
import { AppError } from "../utils/app-error.js";
import { buildUserHistories } from "../utils/history.utils.js";

import { mapUser, mapUseSummary } from "../mappers/user/user.mapper.js";
import {
  userDtoSelect,
  userSummarySelect,
  userHistorySelect,
} from "../selects/user.select.js";
import { buildPaginationMeta } from "../utils/pagination-meta.js";

type GetUsersQuery = {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
};

type GetUserByIdInput = {
  id: number;
  includeDeleted?: boolean;
};

type UpdateUserInput = {
  id: number;
  operatedBy: number;
  data: {
    name?: string;
    email?: string;
    roleId?: number;
  };
};

type DeleteUserInput = {
  id: number;
};

/**
 * ユーザー一覧取得
 */
export const getUsersService = async (query: GetUsersQuery) => {
  // ページネーション設定
  const { skip, take, page, limit } = buildPagination({
    page: query.page,
    limit: query.limit,
  });

  const where = query.includeDeleted
    ? {}
    : {
        deletedAt: null,
      };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,

      select: userSummarySelect,
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    data: users.map((user) =>
      mapUseSummary(user, {
        includeDeleted: query.includeDeleted,
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
 * ユーザー詳細取得
 */
export const getUserByIdService = async ({
  id,
  includeDeleted = false,
}: GetUserByIdInput) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      ...(includeDeleted
        ? {}
        : {
            deletedAt: null,
          }),
    },

    select: userDtoSelect,
  });

  if (!user) {
    throw new AppError("user not found", 404, "USER_NOT_FOUND");
  }

  return mapUser(user, {
    includeDeleted,
  });
};

/**
 * ユーザー更新
 */
export const updateUserService = async ({
  id,
  operatedBy,
  data,
}: UpdateUserInput) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const HISTORY_ACTION_UPDATE = 1;

    // ユーザー存在確認
    const user = await tx.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      select: userHistorySelect,
    });

    if (!user) {
      throw new AppError("user not found", 404, "USER_NOT_FOUND");
    }

    // Role存在確認
    let nextRole: { name: string } | null = null;

    if (data.roleId !== undefined) {
      nextRole = await tx.userRole.findUnique({
        where: {
          id: data.roleId,
        },

        select: {
          name: true,
        },
      });

      if (!nextRole) {
        throw new AppError("invalid role", 422, "INVALID_ROLE");
      }
    }

    // 最後のADMIN降格防止
    if (
      id === operatedBy &&
      nextRole &&
      user.role.name === "ADMIN" &&
      nextRole.name !== "ADMIN"
    ) {
      const adminCount = await tx.user.count({
        where: {
          deletedAt: null,

          role: {
            name: "ADMIN",
          },
        },
      });

      if (adminCount <= 1) {
        throw new AppError("last admin protected", 400, "LAST_ADMIN_PROTECTED");
      }
    }

    // 履歴生成（メモリ）
    const histories = buildUserHistories({
      before: {
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      },

      after: data,

      userId: id,
      operatedBy,
      actionId: HISTORY_ACTION_UPDATE,
    });

    // 差分なし
    if (histories.length === 0) {
      const currentUser = await tx.user.findFirstOrThrow({
        where: {
          id,
          deletedAt: null,
        },

        select: userDtoSelect,
      });

      return mapUser(currentUser);
    }

    const updatedUser = await tx.user.update({
      where: {
        id,
      },

      data,

      select: userDtoSelect,
    });

    // 履歴保存
    await tx.userHistory.createMany({
      data: histories,
    });

    return mapUser(updatedUser);
  });
};

/**
 * ユーザー削除
 */
export const deleteUserService = async ({ id }: DeleteUserInput) => {
  const result = await prisma.user.updateMany({
    where: {
      id,
      deletedAt: null,
    },

    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new AppError("user not found", 404, "USER_NOT_FOUND");
  }
};
