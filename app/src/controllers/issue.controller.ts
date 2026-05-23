import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import {
  createIssueService,
  getIssuesService,
} from "../services/issue.service.js";

export const createIssueController = async (
  req: AuthRequest,
  res: Response,
) => {
  const projectId = Number(req.params.projectId);

  const issue = await createIssueService({
    projectId,
    userId: req.user!.id,
    data: req.body,
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
