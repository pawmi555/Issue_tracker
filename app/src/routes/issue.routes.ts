import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createIssueController,
  getIssuesController,
} from "../controllers/issue.controller.js";
import {
  createIssueSchema,
  getIssuesQuerySchema,
} from "../validators/issue.validation.js";

const router = Router();

router.post(
  "/projects/:projectId/issues",

  authMiddleware,

  validate({ body: createIssueSchema }),

  asyncHandler(createIssueController),
);

router.get(
  "/projects/:projectId/issues",

  authMiddleware,

  validate({ query: getIssuesQuerySchema }),

  asyncHandler(getIssuesController),
);

export default router;
