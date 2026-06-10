import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createIssue,
  getIssues,
  updateIssue,
  getIssueDetail,
  deleteIssue,
  restoreIssue,
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
  asyncHandler(createIssue),
);

router.get(
  "/projects/:projectId/issues",
  authMiddleware,
  validate({ query: getIssuesQuerySchema }),
  asyncHandler(getIssues),
);

router.patch(
  "/issues/:id",
  authMiddleware,
  validate({ body: updateIssueSchema }),
  asyncHandler(updateIssue),
);

router.get(
  "/issues/:id",
  authMiddleware,
  validate({
    params: issueIdSchema,
    query: getIssueQuerySchema,
  }),
  asyncHandler(getIssueDetail),
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
