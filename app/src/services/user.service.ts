import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

import { buildPagination } from "../utils/pagination.js";
import { AppError } from "../utils/app-error.js";
import { buildUserHistories } from "../utils/history.utils.js";

type GetUsersQuery = {
  page?: number;
  limit?: number;
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

/**
 * ユーザー一覧取得
 */
export const getUsersService = async (query: GetUsersQuery) => {
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

      select: {
        id: true,
        name: true,
        email: true,

        role: {
          select: {
            id: true,
            name: true,
          },
        },

        createdAt: true,
        deletedAt: true,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    items: users,

    pagination: {
      page,
      limit,
      total,
    },
  };
};

/**
 * ユーザー詳細取得
 */
export const getUserByIdService = async (
  id: number,
  includeDeleted = false,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      ...(includeDeleted
        ? {}
        : {
            deletedAt: null,
          }),
    },

    select: {
      id: true,
      name: true,
      email: true,

      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("user not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

/**
 * ユーザー更新
 */
export const updateUserService = async ({
  id,
  operatedBy,
  data,
}: UpdateUserInput) => {
  // レスポンス定義
  const userResponseSelect = {
    id: true,
    name: true,
    email: true,

    role: {
      select: {
        id: true,
        name: true,
      },
    },

    updatedAt: true,
  } satisfies Prisma.UserSelect;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const HISTORY_ACTION_UPDATE = 1;

    // ユーザー存在確認
    const user = await tx.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,

        role: {
          select: {
            name: true,
          },
        },
      },
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
      return tx.user.findFirstOrThrow({
        where: {
          id,
          deletedAt: null,
        },

        select: userResponseSelect,
      });
    }

    const updatedUser = await tx.user.update({
      where: {
        id,
      },

      data,

      select: userResponseSelect,
    });

    // 履歴保存
    await tx.userHistory.createMany({
      data: histories,
    });

    return updatedUser;
  });
};

/**
 * ユーザー削除
 */
export const deleteUserService = async (id: number) => {
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
