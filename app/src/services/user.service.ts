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
export const getUsers = async (query: GetUsersQuery) => {
  const { page, limit, skip, take } = buildPagination({
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
export const getUserById = async (id: number) => {
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
export const updateUser = async (id: number, name: string) => {
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
  });

  return user;
};

/**
 * ユーザー削除
 */
export const deleteUser = async (id: number) => {
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
