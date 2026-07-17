import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteComment } from "../../../api/comment";

import { commentKeys } from "../queryKeys/commentKeys";
import { issueKeys } from "../../issue/queryKeys/issueKeys";

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,

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
