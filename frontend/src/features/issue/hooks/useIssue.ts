import { useQuery } from "@tanstack/react-query";

import { getIssue } from "../../../api/issue";

import { issueKeys } from "../queryKeys/issueKeys";

export const useIssue = (issueId: number) => {
  return useQuery({
    queryKey: issueKeys.detail(issueId),
    queryFn: () =>
      getIssue({
        issueId,
        include: "project,assignee,reporter",
      }),
    enabled: Number.isInteger(issueId) && issueId > 0,
  });
};
