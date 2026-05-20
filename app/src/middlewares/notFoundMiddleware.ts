import { Request, Response, NextFunction } from "express";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);

  return res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: "Route not found",
  });
};
