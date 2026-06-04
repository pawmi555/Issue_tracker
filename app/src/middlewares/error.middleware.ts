import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";

/**
 * グローバルエラーハンドリングMiddleware
 *
 * AppErrorの場合は定義済みのステータスコードと
 * エラーレスポンスを返却する。
 *
 * AppError以外の予期しない例外は
 * 500を返す。
 */
export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
};
