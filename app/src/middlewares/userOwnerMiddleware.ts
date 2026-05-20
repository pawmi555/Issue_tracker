import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/auth-request.js";

export const adminOrSelfMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const loginUserId = req.user?.id;
  const targetUserId = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: {
      id: loginUserId,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  // ADMINは許可
  if (user.role.name === "ADMIN") {
    return next();
  }

  // 自分自身は許可
  if (loginUserId === targetUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    code: "FORBIDDEN",
    message: "Forbidden",
  });
};
