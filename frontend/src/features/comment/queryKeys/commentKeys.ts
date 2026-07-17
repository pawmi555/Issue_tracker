import type { GetCommentsParams } from "../types/comment.types";

export const commentKeys = {
  all: ["comments"] as const,

  lists: () => [...commentKeys.all, "list"] as const,

  issueLists: (issueId: number) =>
    [...commentKeys.lists(), "issue", issueId] as const,

  list: (params: GetCommentsParams) =>
    [...commentKeys.issueLists(params.issueId), params] as const,
};
