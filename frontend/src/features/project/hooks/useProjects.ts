import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getProjects } from "../../../api/project";

import type { GetProjectsParams } from "../types/project.types";

import { projectKeys } from "./projectKeys";

export const useProjects = (params: GetProjectsParams) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => getProjects(params),

    /**
     * ページを切り替えたとき、次のデータが返るまで
     * 直前の一覧を維持する。
     */
    placeholderData: keepPreviousData,
  });
};
