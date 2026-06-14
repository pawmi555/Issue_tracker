import { Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import { getIssueHistoriesService } from "../services/history.service.js";
import { getHistorySchema } from "../validators/history.validators.js";

export const getIssueHistories = async (req: AuthRequest, res: Response) => {
  const issueId = Number(req.params.id);

  const query = getHistorySchema.parse(req.query);

  const result = await getIssueHistoriesService({
    issueId,
    userId: req.user!.id,
    query,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};
