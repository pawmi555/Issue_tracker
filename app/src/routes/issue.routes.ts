import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createIssueController,
  getIssuesController,
  updateIssueController,
  getIssueDetailController,
  deleteIssueController,
} from "../controllers/issue.controller.js";
import {
  createIssueSchema,
  getIssuesQuerySchema,
  updateIssueSchema,
  issueIdSchema,
  getIssueQuerySchema,
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

router.patch(
  "/issues/:id",
  authMiddleware,
  validate(updateIssueSchema),
  asyncHandler(updateIssueController),
);

router.get(
  "/issues/:id",
  authMiddleware,
  validate({
    params: issueIdSchema,
    query: getIssueQuerySchema,
  }),
  asyncHandler(getIssueDetailController),
);

router.delete(
  "/issues/:id",
  authMiddleware,
  validate({
    params: issueIdSchema,
  }),
  asyncHandler(deleteIssueController),
);

export default router;
