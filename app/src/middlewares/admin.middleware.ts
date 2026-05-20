import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth-request.js";
import { prisma } from "../lib/prisma.js";

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

  console.log(req.user);

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
