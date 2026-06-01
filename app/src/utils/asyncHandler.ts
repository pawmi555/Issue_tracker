import { Request, Response, NextFunction } from "express";

/**
 * 非同期のExpressハンドラをラップし、
 * 発生したエラーをError Middlewareへ転送する共通関数
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
