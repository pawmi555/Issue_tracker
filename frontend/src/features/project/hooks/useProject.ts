import { useQuery } from "@tanstack/react-query";

import { getProject } from "../../../api/project";

import { projectKeys } from "./projectKeys";

export const useProject = (projectId: number) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () =>
      getProject({
        projectId,
      }),

    enabled: Number.isInteger(projectId) && projectId > 0,
  });
};
