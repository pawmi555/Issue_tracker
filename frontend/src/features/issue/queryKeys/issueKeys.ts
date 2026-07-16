import type { GetIssuesParams } from "../types/issue.types";

export const issueKeys = {
  all: ["issues"] as const,

  lists: () => [...issueKeys.all, "list"] as const,

  projectLists: (projectId: number) =>
    [...issueKeys.lists(), "project", projectId] as const,

  list: (params: GetIssuesParams) =>
    [...issueKeys.projectLists(params.projectId), params] as const,

  details: () => [...issueKeys.all, "detail"] as const,

  detail: (issueId: number) => [...issueKeys.details(), issueId] as const,
};
