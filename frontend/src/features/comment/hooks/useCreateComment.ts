import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createComment } from "../../../api/comment";

import { commentKeys } from "../queryKeys/commentKeys";
import { issueKeys } from "../../issue/queryKeys/issueKeys";

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: commentKeys.issueLists(variables.issueId),
        }),

        queryClient.invalidateQueries({
          queryKey: issueKeys.detail(variables.issueId),
        }),
      ]);
    },
  });
};
