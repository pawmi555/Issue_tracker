import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth-request.js";
import { prisma } from "../lib/prisma.js";

/**
 * 管理者権限チェックMiddleware
 *
 * 認証済みユーザーのロールを確認し、
 * ADMINロールを持つユーザーのみアクセスを許可する。
 *
 * 未認証の場合は401、
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

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    include: {
      role: true,
    },
  });

  if (!user || user.role.name !== "ADMIN") {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "Forbidden",
    });
  }

  next();
};
