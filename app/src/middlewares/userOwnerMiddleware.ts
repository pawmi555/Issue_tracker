import type { Response, NextFunction } from "express";
import type { z } from "zod";

import { prisma } from "../lib/prisma.js";

import type { AuthRequest } from "../types/auth-request.js";
import type { ValidatedAuthRequest } from "../types/validated-request.js";

import type {
  getUserDetailSchema,
  userIdSchema,
} from "../validators/user.validation.js";

/**
 * 管理者または本人のみ許可するMiddleware
 *
 * 認証済みユーザーのロールを確認し、
 * ADMINユーザーまたは対象ユーザー本人のみ
 * アクセスを許可する。
 *
 * 未認証の場合は401、
 * 権限不足の場合は403を返す。
 */
export const adminOrSelfMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const loginUserId = req.user?.id;
  const targetUserId = Number(req.params.id);

  if (!loginUserId) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  if (Number.isNaN(targetUserId)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: loginUserId,
      deletedAt: null,
    },
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const isAdmin = user.role.name === "ADMIN";
  const isSelf = loginUserId === targetUserId;

  if (isAdmin || isSelf) {
    return next();
  }

  return res.status(403).json({
    success: false,
    code: "FORBIDDEN",
    message: "Forbidden",
  });
};

type UserDetailAuthorizationRequest = ValidatedAuthRequest<
  z.infer<typeof userIdSchema>,
  z.infer<typeof getUserDetailSchema>,
  never
>;

/**
 * User詳細取得の認可Middleware
 *
 * 通常取得:
 * - 本人またはADMINを許可する
 *
 * includeDeleted=true:
 * - ADMINのみ許可する
 */
export const userDetailAuthorizationMiddleware = async (
  req: UserDetailAuthorizationRequest,
  res: Response,
  next: NextFunction,
) => {
  const loginUserId = req.user?.id;

  if (!loginUserId) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const targetUserId = req.validatedParams!.id;
  const includeDeleted = req.validatedQuery!.includeDeleted;

  const loginUser = await prisma.user.findFirst({
    where: {
      id: loginUserId,
      deletedAt: null,
    },
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!loginUser) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const isAdmin = loginUser.role.name === "ADMIN";

  // includeDeletedを利用できるのはADMINのみ
  if (includeDeleted && !isAdmin) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "Forbidden",
    });
  }

  // ADMINは通常・削除済みの両方を取得可能
  if (isAdmin) {
    return next();
  }

  // includeDeleted=falseの場合、本人の情報のみ取得可能
  if (loginUserId === targetUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    code: "FORBIDDEN",
    message: "Forbidden",
  });
};
