import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProject } from "../../../api/project";

import type { Project } from "../types/project.types";

import { projectKeys } from "./projectKeys";

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,

    onSuccess: async (project: Project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project);

      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
};
