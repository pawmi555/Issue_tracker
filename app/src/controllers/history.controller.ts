import type { z } from "zod";
import { Response } from "express";

import { getIssueHistoriesService } from "../services/history.service.js";

import type {
  getHistorySchema,
  issueIdSchema,
} from "../validators/history.validators.js";

import { ValidatedAuthRequest } from "../types/validated-request.js";

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
