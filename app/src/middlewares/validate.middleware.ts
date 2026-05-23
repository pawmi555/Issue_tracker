import { Request, Response, NextFunction } from "express";

import { ZodError, ZodSchema } from "zod";

type ValidationSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validate =
  (schemas: ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      // query
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      // params
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
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
  };
