import type { z } from "zod";
import type { Response } from "express";

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

import type { ValidatedAuthRequest } from "../types/validated-request.js";

export const createIssue = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectIdSchema>,
    never,
    z.infer<typeof createIssueSchema>
  >,
  res: Response,
) => {
  const projectId = req.validatedParams!.projectId;
  const userId = req.user!.id;
  const data = req.validatedBody!;

  const issue = await createIssueService({
    projectId,
    userId,
    data,
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
  const projectId = req.validatedParams!.projectId;
  const userId = req.user!.id;
  const query = req.validatedQuery!;

  const result = await getIssuesService({
    projectId,
    userId,
    includeDeleted: query.includeDeleted,
    query,
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
  const issueId = req.validatedParams!.id;
  const userId = req.user!.id;
  const query = req.validatedQuery!;

  const issue = await getIssueDetailService({
    issueId,
    userId,
    includeDeleted: query.includeDeleted,
    query,
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
  const issueId = req.validatedParams!.id;
  const userId = req.user!.id;
  const data = req.validatedBody!;

  const issue = await updateIssueService({
    issueId,
    userId,
    data,
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
  const issueId = req.validatedParams!.id;
  const userId = req.user!.id;

  await deleteIssueService({
    issueId,
    userId,
  });

  res.sendStatus(204);
};

export const restoreIssue = async (
  req: ValidatedAuthRequest<z.infer<typeof issueIdSchema>, never, never>,
  res: Response,
) => {
  const issueId = req.validatedParams!.id;
  const userId = req.user!.id;

  await restoreIssueService({
    issueId,
    userId,
  });

  res.status(200).json({
    success: true,
  });
};
