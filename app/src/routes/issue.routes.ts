import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createIssue,
  getIssues,
  getIssueDetail,
  updateIssue,
  deleteIssue,
  restoreIssue,
} from "../controllers/issue.controller.js";
import {
  createIssueSchema,
  getIssuesQuerySchema,
  getIssueDetailQuerySchema,
  updateIssueSchema,
  projectIdSchema,
  issueIdSchema,
} from "../validators/issue.validation.js";

const router = Router();

router.post(
  "/projects/:projectId/issues",
  authMiddleware,
  validate({ params: projectIdSchema, body: createIssueSchema }),
  asyncHandler(createIssue),
);

router.get(
  "/projects/:projectId/issues",
  authMiddleware,
  validate({ params: projectIdSchema, query: getIssuesQuerySchema }),
  asyncHandler(getIssues),
);

router.get(
  "/issues/:id",
  authMiddleware,
  validate({
    params: issueIdSchema,
    query: getIssueDetailQuerySchema,
  }),
  asyncHandler(getIssueDetail),
);

router.patch(
  "/issues/:id",
  authMiddleware,
  validate({ params: issueIdSchema, body: updateIssueSchema }),
  asyncHandler(updateIssue),
);

router.delete(
  "/issues/:id",
  authMiddleware,
  validate({
    params: issueIdSchema,
  }),
  asyncHandler(deleteIssue),
);

router.post(
  "/issues/:id/restore",
  authMiddleware,
  validate({
    params: issueIdSchema,
  }),
  asyncHandler(restoreIssue),
);

export default router;
