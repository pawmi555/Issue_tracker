import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIssueHistories } from "../controllers/history.controller.js";

const router = Router();

router.get(
  "/issues/:id/histories",
  authMiddleware,
  asyncHandler(getIssueHistories),
);

export default router;
