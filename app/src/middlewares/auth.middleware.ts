import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../types/auth-request.js";

interface JwtPayload {
  userId: number;
}

/**
 * JWT認証を行うMiddleware
 *
 * AuthorizationヘッダーのBearer Tokenを検証し、
 * 認証済みユーザー情報をreq.userへ設定する。
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log("auth start");
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (typeof decoded !== "object" || !("userId" in decoded)) {
      throw new Error();
    }

    req.user = { id: Number(decoded.userId) };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
  }
  console.log("auth end");
};
