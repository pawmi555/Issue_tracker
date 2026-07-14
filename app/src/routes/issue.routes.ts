import { Router } from "express";

import {
  createIssue,
  getIssues,
  getIssueDetail,
  updateIssue,
  deleteIssue,
  restoreIssue,
} from "../controllers/issue.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createIssueSchema,
  getIssuesQuerySchema,
  getIssueDetailQuerySchema,
  updateIssueSchema,
  projectIdSchema,
  issueIdSchema,
} from "../validators/issue.validation.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/projects/:projectId/issues",
  validate({ params: projectIdSchema, body: createIssueSchema }),
  asyncHandler(createIssue),
);

router.get(
  "/projects/:projectId/issues",
  validate({ params: projectIdSchema, query: getIssuesQuerySchema }),
  asyncHandler(getIssues),
);

router.get(
  "/issues/:id",
  validate({
    params: issueIdSchema,
    query: getIssueDetailQuerySchema,
  }),
  asyncHandler(getIssueDetail),
);

router.patch(
  "/issues/:id",
  validate({ params: issueIdSchema, body: updateIssueSchema }),
  asyncHandler(updateIssue),
);

router.delete(
  "/issues/:id",
  validate({
    params: issueIdSchema,
  }),
  asyncHandler(deleteIssue),
);

router.post(
  "/issues/:id/restore",
  validate({
    params: issueIdSchema,
  }),
  asyncHandler(restoreIssue),
);

export default router;
