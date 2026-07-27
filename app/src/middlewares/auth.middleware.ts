import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma.js";

import type { AuthRequest } from "../types/auth-request.js";

interface JwtPayload {
  userId: number;
}

/**
 * JWT認証を行うMiddleware
 *
 * AuthorizationヘッダーのBearer Tokenを検証し、
 * Tokenに含まれるUserが未削除であることを確認する。
 *
 * 認証に成功した場合は、
 * 認証済みユーザー情報をreq.userへ設定する。
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const token = auth.slice("Bearer ".length);

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
  }

  if (
    typeof decoded !== "object" ||
    !("userId" in decoded) ||
    !Number.isInteger(decoded.userId)
  ) {
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    req.user = {
      id: user.id,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
