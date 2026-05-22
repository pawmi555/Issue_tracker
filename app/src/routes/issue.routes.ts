import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createIssueController } from "../controllers/issue.controller.js";
import { createIssueSchema } from "../validators/issue.validation.js";

const router = Router();
router.post(
  "/projects/:projectId/issues",

  authMiddleware,

  validate(createIssueSchema),

  asyncHandler(createIssueController),
);
export default router;
