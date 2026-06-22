import { Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import {
  createIssueService,
  getIssuesService,
  updateIssueService,
  getIssueDetailService,
  deleteIssueService,
  restoreIssueService,
} from "../services/issue.service.js";

export const createIssue = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const userId = req.user!.id;
  const issue = await createIssueService({
    projectId,
    userId,
    data: req.body,
  });

  res.status(201).json({
    success: true,
    data: issue,
  });
};

export const getIssues = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const userId = req.user!.id;

  const result = await getIssuesService({
    projectId,
    userId,
    query: req.query,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const updateIssue = async (req: AuthRequest, res: Response) => {
  const issueId = Number(req.params.id);
  const userId = req.user!.id;

  const issue = await updateIssueService({
    issueId,
    userId,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: issue,
  });
};

export const getIssueDetail = async (req: AuthRequest, res: Response) => {
  const issueId = Number(req.params.id);
  const userId = req.user!.id;
  const issue = await getIssueDetailService({
    issueId,
    userId,
    query: req.query,
    includeDeleted: req.query.includeDeleted === "true",
  });

  res.status(200).json({
    success: true,
    data: issue,
  });
};

export const deleteIssue = async (req: AuthRequest, res: Response) => {
  const issueId = Number(req.params.id);
  const userId = req.user!.id;
  await deleteIssueService({
    issueId,
    userId,
  });

  res.sendStatus(204);
};

export const restoreIssue = async (req: AuthRequest, res: Response) => {
  const issueId = Number(req.params.id);
  const userId = req.user!.id;
  await restoreIssueService({
    issueId,
    userId,
  });

  res.status(200).json({
    success: true,
  });
};
