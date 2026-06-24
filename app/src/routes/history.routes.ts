import { Router } from "express";

import { getIssueHistories } from "../controllers/history.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  getHistorySchema,
  issueIdSchema,
} from "../validators/history.validators.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// TODO:
// 現在はissueのみAPIから履歴参照可能。
// user,project,commentも履歴参照できるように実装予定。
router.get(
  "/issues/:id/histories",
  validate({ params: issueIdSchema, query: getHistorySchema }),
  authMiddleware,
  asyncHandler(getIssueHistories),
);

export default router;
