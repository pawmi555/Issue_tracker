import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteIssue } from "../../../api/issue";

import { issueKeys } from "../queryKeys/issueKeys";
import { projectKeys } from "../../project/queryKeys/projectKeys";

type DeleteIssueVariables = {
  issueId: number;
  projectId: number;
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId }: DeleteIssueVariables) => deleteIssue(issueId),

    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: issueKeys.detail(variables.issueId),
      });

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
