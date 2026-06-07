import { Router } from "express";
import {
  createCommentController,
  getCommentsController,
  updateCommentController,
} from "../controllers/comment.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/issues/:id/comments",
  authMiddleware,
  asyncHandler(createCommentController),
);

router.get(
  "/issues/:id/comments",
  authMiddleware,
  asyncHandler(getCommentsController),
);

router.patch("/comments/:id", authMiddleware, updateCommentController);

export default router;
