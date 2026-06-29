import type { z } from "zod";
import { Response } from "express";

import {
  getUserHistoriesService,
  getProjectHistoriesService,
  getIssueHistoriesService,
  getCommentHistoriesService,
} from "../services/history.service.js";

import type {
  getHistorySchema,
  userIdSchema,
  projectIdSchema,
  issueIdSchema,
  commentIdSchema,
} from "../validators/history.validators.js";

import { ValidatedAuthRequest } from "../types/validated-request.js";

export const getUserHistories = async (
  req: ValidatedAuthRequest<
    z.infer<typeof userIdSchema>,
    z.infer<typeof getHistorySchema>,
    never
  >,
  res: Response,
) => {
  const result = await getUserHistoriesService({
    targetUserId: req.validatedParams!.id,
    query: req.validatedQuery!,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getProjectHistories = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectIdSchema>,
    z.infer<typeof getHistorySchema>,
    never
  >,
  res: Response,
) => {
  const result = await getProjectHistoriesService({
    projectId: req.validatedParams!.id,
    userId: req.user!.id,
    query: req.validatedQuery!,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getIssueHistories = async (
  req: ValidatedAuthRequest<
    z.infer<typeof issueIdSchema>,
    z.infer<typeof getHistorySchema>,
    never
  >,
  res: Response,
) => {
  const result = await getIssueHistoriesService({
    issueId: req.validatedParams!.id,
    userId: req.user!.id,
    query: req.validatedQuery!,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getCommentHistories = async (
  req: ValidatedAuthRequest<
    z.infer<typeof commentIdSchema>,
    z.infer<typeof getHistorySchema>,
    never
  >,
  res: Response,
) => {
  const result = await getCommentHistoriesService({
    commentId: req.validatedParams!.id,
    userId: req.user!.id,
    query: req.validatedQuery!,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};
