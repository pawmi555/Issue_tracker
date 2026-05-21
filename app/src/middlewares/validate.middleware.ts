import { Request, Response, NextFunction } from "express";

import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);

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
