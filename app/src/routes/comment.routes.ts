import { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/issues/:id/comments",
  authMiddleware,
  asyncHandler(createComment),
);

router.get("/issues/:id/comments", authMiddleware, asyncHandler(getComments));

router.patch("/comments/:id", authMiddleware, asyncHandler(updateComment));

router.delete("/comments/:id", authMiddleware, asyncHandler(deleteComment));

export default router;
