import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getIssues } from "../../../api/issue";

import type { GetIssuesParams } from "../types/issue.types";

import { issueKeys } from "../queryKeys/issueKeys";

export const useIssues = (params: GetIssuesParams) => {
  return useQuery({
    queryKey: issueKeys.list(params),
    queryFn: () => getIssues(params),
    enabled: Number.isInteger(params.projectId) && params.projectId > 0,
    placeholderData: keepPreviousData,
  });
};
