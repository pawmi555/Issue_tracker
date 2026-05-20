import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(422).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: error.errors?.[0]?.message || "Validation error",
      });
    }
  };
