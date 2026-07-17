import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getComments } from "../../../api/comment";

import type { GetCommentsParams } from "../types/comment.types";

import { commentKeys } from "../queryKeys/commentKeys";

export const useComments = (params: GetCommentsParams) => {
  return useQuery({
    queryKey: commentKeys.list(params),
    queryFn: () => getComments(params),

    enabled: Number.isInteger(params.issueId) && params.issueId > 0,

    placeholderData: keepPreviousData,
  });
};
