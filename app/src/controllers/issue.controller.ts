import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import { createIssueService } from "../services/createIssue.service.js";

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
