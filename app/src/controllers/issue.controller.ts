import type { z } from "zod";
import { Response } from "express";

import {
  createIssueService,
  getIssuesService,
  updateIssueService,
  getIssueDetailService,
  deleteIssueService,
  restoreIssueService,
} from "../services/issue.service.js";

import type {
  projectIdSchema,
  createIssueSchema,
  getIssuesQuerySchema,
  getIssueDetailQuerySchema,
  updateIssueSchema,
  issueIdSchema,
} from "../validators/issue.validation.js";

import { ValidatedAuthRequest } from "../types/validated-request.js";

export const createIssue = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectIdSchema>,
    never,
    z.infer<typeof createIssueSchema>
  >,
  res: Response,
) => {
  const issue = await createIssueService({
    projectId: req.validatedParams!.projectId,
    userId: req.user!.id,
    data: req.validatedBody!,
  });

  res.status(201).json({
    success: true,
    data: issue,
  });
};

export const getIssues = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectIdSchema>,
    z.infer<typeof getIssuesQuerySchema>,
    never
  >,
  res: Response,
) => {
  const result = await getIssuesService({
    projectId: req.validatedParams!.projectId,
    userId: req.user!.id,
    includeDeleted: req.validatedQuery!.includeDeleted,
    query: req.validatedQuery!,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getIssueDetail = async (
  req: ValidatedAuthRequest<
    z.infer<typeof issueIdSchema>,
    z.infer<typeof getIssueDetailQuerySchema>,
    never
  >,
  res: Response,
) => {
  const issue = await getIssueDetailService({
    issueId: req.validatedParams!.id,
    userId: req.user!.id,
    includeDeleted: req.validatedQuery!.includeDeleted,
    query: req.validatedQuery!,
  });

  res.status(200).json({
    success: true,
    data: issue,
  });
};

export const updateIssue = async (
  req: ValidatedAuthRequest<
    z.infer<typeof issueIdSchema>,
    never,
    z.infer<typeof updateIssueSchema>
  >,
  res: Response,
) => {
  const issue = await updateIssueService({
    issueId: req.validatedParams!.id,
    userId: req.user!.id,
    data: req.validatedBody!,
  });

  res.status(200).json({
    success: true,
    data: issue,
  });
};

export const deleteIssue = async (
  req: ValidatedAuthRequest<z.infer<typeof issueIdSchema>, never, never>,
  res: Response,
) => {
  await deleteIssueService({
    issueId: req.validatedParams!.id,
    userId: req.user!.id,
  });

  res.sendStatus(204);
};

export const restoreIssue = async (
  req: ValidatedAuthRequest<z.infer<typeof issueIdSchema>, never, never>,
  res: Response,
) => {
  await restoreIssueService({
    issueId: req.validatedParams!.id,
    userId: req.user!.id,
  });

  res.status(200).json({
    success: true,
  });
};
