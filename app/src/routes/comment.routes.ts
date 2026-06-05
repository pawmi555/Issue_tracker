import { Router } from "express";
import { createCommentController } from "../controllers/comment.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/issues/:id/comments",
  authMiddleware,
  asyncHandler(createCommentController),
);

export default router;
