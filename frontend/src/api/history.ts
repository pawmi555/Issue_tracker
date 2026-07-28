import apiClient from "./axios";

import type { ApiPaginatedResponse } from "../types/api";

import type {
  GetIssueHistoriesParams,
  History,
} from "../features/history/types/history.types";

export const getIssueHistories = async ({
  issueId,
  page = 1,
  limit = 10,
}: GetIssueHistoriesParams): Promise<ApiPaginatedResponse<History>> => {
  const response = await apiClient.get<ApiPaginatedResponse<History>>(
    `/issues/${issueId}/histories`,
    {
      params: {
        page,
        limit,
      },
    },
  );

  return response.data;
};
