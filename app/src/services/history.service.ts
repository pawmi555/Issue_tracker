import { getHistory } from "../repositories/history.repository.js";
import type { GetHistoryQuery } from "../validators/history.validators.js";

type GetIssueHistoriesInput = {
  issueId: number;
  userId: number;
  query: GetHistoryQuery;
};

export const getIssueHistoriesService = async ({
  issueId,
  userId,
  query,
}: GetIssueHistoriesInput) => {
  return getHistory({
    issueId,
    userId,
    query,
  });
};
