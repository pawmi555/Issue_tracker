import { Router } from "express";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  issueIdSchema,
  commentIdSchema,
  getCommentsSchema,
  updateCommentSchema,
  createCommentSchema,
} from "../validators/comment.validators.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/issues/:id/comments",
  authMiddleware,
  validate({ params: issueIdSchema, body: createCommentSchema }),
  asyncHandler(createComment),
);

router.get(
  "/issues/:id/comments",
  authMiddleware,
  validate({ params: issueIdSchema, query: getCommentsSchema }),
  asyncHandler(getComments),
);

router.patch(
  "/comments/:id",
  authMiddleware,
  validate({ params: commentIdSchema, body: updateCommentSchema }),
  asyncHandler(updateComment),
);

router.delete(
  "/comments/:id",
  authMiddleware,
  validate({ params: commentIdSchema }),
  asyncHandler(deleteComment),
);

export default router;
