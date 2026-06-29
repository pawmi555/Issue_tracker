import { Router } from "express";

import {
  getUserHistories,
  getProjectHistories,
  getIssueHistories,
  getCommentHistories,
} from "../controllers/history.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminOrSelfMiddleware } from "../middlewares/userOwnerMiddleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  getHistorySchema,
  userIdSchema,
  projectIdSchema,
  issueIdSchema,
  commentIdSchema,
} from "../validators/history.validators.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/users/:id/histories",
  validate({ params: userIdSchema, query: getHistorySchema }),
  authMiddleware,
  adminOrSelfMiddleware,
  asyncHandler(getUserHistories),
);

router.get(
  "/projects/:id/histories",
  validate({ params: projectIdSchema, query: getHistorySchema }),
  authMiddleware,
  asyncHandler(getProjectHistories),
);

router.get(
  "/issues/:id/histories",
  validate({ params: issueIdSchema, query: getHistorySchema }),
  authMiddleware,
  asyncHandler(getIssueHistories),
);

router.get(
  "/comments/:id/histories",
  validate({ params: commentIdSchema, query: getHistorySchema }),
  authMiddleware,
  asyncHandler(getCommentHistories),
);

export default router;
