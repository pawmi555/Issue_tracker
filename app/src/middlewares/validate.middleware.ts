import type { Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ZodError } from "zod";

import type { ValidatedAuthRequest } from "../types/validated-request.js";

type ValidationSchemas<P = unknown, Q = unknown, B = unknown> = {
  params?: ZodType<P>;
  query?: ZodType<Q>;
  body?: ZodType<B>;
};

/**
 * Zod Schemaによるリクエスト検証Middlewareを生成する
 *
 * body、query、paramsの検証を行い、
 * 検証済みデータをreqへ格納する。
 *
 * バリデーションエラーの場合は
 * 422を返す。
 *
 * @param schemas 検証対象のSchema定義
 */
export const validate =
  <P = unknown, Q = unknown, B = unknown>(
    schemas: ValidationSchemas<P, Q, B>,
  ) =>
  (req: ValidatedAuthRequest<P, Q, B>, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.validatedBody = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.validatedParams = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "入力内容が不正です",
          errors: error.issues,
        });
      }

      next(error);
    }
  };
