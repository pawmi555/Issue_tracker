import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProject } from "../../../api/project";

import { projectKeys } from "../queryKeys/projectKeys";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,

    onSuccess: async (_, projectId) => {
      queryClient.removeQueries({
        queryKey: projectKeys.detail(projectId),
      });

      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
};
