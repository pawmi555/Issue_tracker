import { prisma } from "../lib/prisma.js";
import { buildPagination } from "../utils/pagination.js";
import { AppError } from "../utils/app-error.js";

type GetUsersQuery = {
  page?: number;
  limit?: number;
};

/**
 * ユーザー一覧取得
 */
export const getUsersService = async (query: GetUsersQuery) => {
  const { skip, take } = buildPagination({
    page: query.page,
    limit: query.limit,
  });
  return prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    skip,
    take,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

/**
 * ユーザー詳細取得
 */
export const getUserByIdService = async (id: number) => {
  if (Number.isNaN(id)) {
    throw new AppError("invalid user id", 400, "INVALID_USER_ID");
  }

  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

/**
 * ユーザー更新
 */
export const updateUserService = async (id: number, name: string) => {
  if (Number.isNaN(id)) {
    throw new AppError("invalid user id", 400, "INVALID_USER_ID");
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * ユーザー削除
 */
export const deleteUserService = async (id: number) => {
  if (Number.isNaN(id)) {
    throw new AppError("invalid user id", 400, "INVALID_USER_ID");
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
