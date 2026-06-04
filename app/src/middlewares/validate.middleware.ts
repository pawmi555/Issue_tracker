import { Request, Response, NextFunction } from "express";
import { ValidatedRequest } from "../types/validated-request.js";
import { ZodError, ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
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
  (schemas: ValidationSchemas) =>
  (req: ValidatedRequest, res: Response, next: NextFunction) => {
    console.log("validate start");
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
          message: error.issues[0]?.message ?? "Validation error",
        });
      }

      next(error);
    }
    console.log("validate end");
  };
