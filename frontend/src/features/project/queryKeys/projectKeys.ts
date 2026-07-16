import type { GetProjectsParams } from "../types/project.types";

export const projectKeys = {
  all: ["projects"] as const,

  lists: () => [...projectKeys.all, "list"] as const,

  list: (params: GetProjectsParams) =>
    [...projectKeys.lists(), params] as const,

  details: () => [...projectKeys.all, "detail"] as const,

  detail: (projectId: number) => [...projectKeys.details(), projectId] as const,
};
