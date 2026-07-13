import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * 非同期のExpressハンドラをラップし、
 * 発生したエラーをError Middlewareへ転送する共通関数
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
