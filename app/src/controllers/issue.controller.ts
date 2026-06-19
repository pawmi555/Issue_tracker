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

import {
  createIssueSchema,
  getIssuesQuerySchema,
} from "../validators/issue.validation.js";

import { parseInclude } from "../utils/include-parser.js";
import { validateIssueIncludes } from "../validators/issue-include.validator.js";
import { IssueIncludeField } from "../types/issue.types.js";

export const createIssue = async (req: AuthRequest, res: Response) => {
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

export const getIssues = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const userId = req.user!.id;
  const query = getIssuesQuerySchema.parse(req.query);
  const includes = parseInclude(query.include);

  validateIssueIncludes(includes, false);

  const result = await getIssuesService({
    projectId,
    userId,
    query: {
      ...query,
      include: includes satisfies IssueIncludeField[],
    },
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const updateIssue = async (req: AuthRequest, res: Response) => {
  const issueId = Number(req.params.id);

  const issue = await updateIssueService({
    issueId,
    userId: req.user!.id,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: issue,
  });
};

export const getIssueDetail = async (req: AuthRequest, res: Response) => {
  const issue = await getIssueDetailService({
    issueId: Number(req.params.id),
    userId: req.user!.id,
    include: req.query.include as string,
    includeDeleted: req.query.includeDeleted === "true",
  });

  res.status(200).json({
    success: true,
    data: issue,
  });
};

export const deleteIssue = async (req: AuthRequest, res: Response) => {
  await deleteIssueService({
    issueId: Number(req.params.id),
    userId: req.user!.id,
  });

  res.sendStatus(204);
};

export const restoreIssue = async (req: AuthRequest, res: Response) => {
  await restoreIssueService({
    issueId: Number(req.params.id),
    userId: req.user!.id,
  });

  res.status(200).json({
    success: true,
  });
};
