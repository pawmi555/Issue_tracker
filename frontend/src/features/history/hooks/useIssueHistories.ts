import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getIssueHistories } from "../../../api/history";

import { historyKeys } from "../queryKeys/historyKeys";

type UseIssueHistoriesParams = {
  issueId: number;
  page: number;
  limit?: number;
};

export const useIssueHistories = ({
  issueId,
  page,
  limit = 10,
}: UseIssueHistoriesParams) => {
  return useQuery({
    queryKey: historyKeys.issueList({
      issueId,
      page,
      limit,
    }),

    queryFn: () =>
      getIssueHistories({
        issueId,
        page,
        limit,
      }),

    enabled:
      Number.isInteger(issueId) &&
      issueId > 0 &&
      Number.isInteger(page) &&
      page > 0,

    placeholderData: keepPreviousData,
  });
};
