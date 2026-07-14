import { Router } from "express";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

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
  validate({ params: issueIdSchema, body: createCommentSchema }),
  asyncHandler(createComment),
);

router.get(
  "/issues/:id/comments",
  validate({ params: issueIdSchema, query: getCommentsSchema }),
  asyncHandler(getComments),
);

router.patch(
  "/comments/:id",
  validate({ params: commentIdSchema, body: updateCommentSchema }),
  asyncHandler(updateComment),
);

router.delete(
  "/comments/:id",
  validate({ params: commentIdSchema }),
  asyncHandler(deleteComment),
);

export default router;
