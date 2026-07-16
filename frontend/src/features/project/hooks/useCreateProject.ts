import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProject } from "../../../api/project";

import { projectKeys } from "./projectKeys";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
};
