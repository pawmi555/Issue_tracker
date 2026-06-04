import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import {
  createIssueService,
  getIssuesService,
  updateIssueService,
  getIssueDetailService,
  deleteIssueService,
  restoreIssueService,
} from "../services/issue.service.js";

import { createIssueSchema } from "../validators/issue.validation.js";

export const createIssueController = async (
  req: AuthRequest,
  res: Response,
) => {
  const projectId = Number(req.params.projectId);

  const data = createIssueSchema.parse(req.body);
  const issue = await createIssueService({
    projectId,
    userId: req.user!.id,
    data,
  });

  res.status(201).json({
    success: true,
    data: issue,
  });
};

export const getIssuesController = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);

  const result = await getIssuesService({
    projectId,
    userId: req.user!.id,
    query: req.query,
  });

  res.json({
    success: true,
    ...result,
  });
};

export const updateIssueController = async (
  req: AuthRequest,
  res: Response,
) => {
  const issueId = Number(req.params.id);

  const issue = await updateIssueService({
    issueId,
    userId: req.user!.id,
    data: req.body,
  });

  res.json({
    success: true,
    data: issue,
  });
};

export const getIssueDetailController = async (
  req: AuthRequest,
  res: Response,
) => {
  const issue = await getIssueDetailService({
    issueId: Number(req.params.id),
    userId: req.user!.id,
    include: req.query.include as string,
    includeDeleted: req.query.includeDeleted === "true",
  });

  res.json({
    success: true,
    data: issue,
  });
};

export const deleteIssueController = async (
  req: AuthRequest,
  res: Response,
) => {
  await deleteIssueService({
    issueId: Number(req.params.id),
    userId: req.user!.id,
  });

  res.json({
    success: true,
  });
};

export const restoreIssueController = async (
  req: AuthRequest,
  res: Response,
) => {
  await restoreIssueService({
    issueId: Number(req.params.id),
    userId: req.user!.id,
  });

  res.json({
    success: true,
  });
};
