import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

/**
 * グローバルエラーハンドリングMiddleware
 *
 * AppErrorの場合は定義済みのステータスコードと
 * エラーレスポンスを返却する。
 *
 * Zod Validation Error及び
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

  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: err.issues,
    });
  }

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
