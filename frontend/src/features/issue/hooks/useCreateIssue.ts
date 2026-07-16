import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createIssue } from "../../../api/issue";

import { issueKeys } from "../queryKeys/issueKeys";
import { projectKeys } from "../../project/queryKeys/projectKeys";

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIssue,

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: issueKeys.projectLists(variables.projectId),
        }),

        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(variables.projectId),
        }),

        queryClient.invalidateQueries({
          queryKey: projectKeys.lists(),
        }),
      ]);
    },
  });
};
