import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import apiRoutes from "./routes/api.routes.js";

import { authMiddleware } from "./middlewares/auth.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFoundMiddleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

/**
 * ---------------------------------------------------
 * 基本設定
 * ---------------------------------------------------
 */
app.disable("x-powered-by");

/**
 * ---------------------------------------------------
 * Security Header
 * ---------------------------------------------------
 */
app.use(helmet());

/**
 * ---------------------------------------------------
 * CORS
 * 本番では origin を環境変数管理推奨
 * ---------------------------------------------------
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

/**
 * ---------------------------------------------------
 * CookieParser
 * ---------------------------------------------------
 */
app.use(cookieParser());

/**
 * ---------------------------------------------------
 * Rate Limit
 * API連打・総当たり対策
 * ---------------------------------------------------
 */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests",
    },
  }),
);

/**
 * ---------------------------------------------------
 * Body Parser
 * ---------------------------------------------------
 */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ---------------------------------------------------
 * Compression
 * レスポンス圧縮
 * ---------------------------------------------------
 */
app.use(compression());

/**
 * ---------------------------------------------------
 * Request Logger
 * ---------------------------------------------------
 */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/**
 * ---------------------------------------------------
 * Public Routes
 * 認証不要
 * ---------------------------------------------------
 */
app.use("/api/v1/auth", authRoutes);

/**
 * ---------------------------------------------------
 * User Routes
 * JWT認証必須
 * ---------------------------------------------------
 */
app.use("/api/v1/users", authMiddleware, userRoutes);

/**
 * ---------------------------------------------------
 * Protected API Routes
 * JWT認証必須
 *
 * - Projects
 * - Issues
 * - Comments
 * - Histories
 * ---------------------------------------------------
 */
app.use("/api/v1", authMiddleware, apiRoutes);

/**
 * ---------------------------------------------------
 * 404 Not Found
 * ---------------------------------------------------
 */
app.use(notFoundMiddleware);

/**
 * ---------------------------------------------------
 * Global Error Handler
 * ---------------------------------------------------
 */
app.use(errorMiddleware);

export default app;
