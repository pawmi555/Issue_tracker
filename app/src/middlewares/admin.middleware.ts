import type { Response, NextFunction } from "express";

import { prisma } from "../lib/prisma.js";

import type { AuthRequest } from "../types/auth-request.js";

/**
 * 管理者権限チェックMiddleware
 *
 * 認証済みかつ未削除のユーザーについて、
 * ADMINロールを持つ場合のみアクセスを許可する。
 *
 * 未認証または削除済みの場合は401、
 * 権限不足の場合は403を返す。
 */
export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: req.user.id,
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

  if (user.role.name !== "ADMIN") {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "Forbidden",
    });
  }

  return next();
};
