import apiClient from "./axios";

import type { ApiPaginatedResponse, ApiSuccessResponse } from "../types/api";

import type {
  CreateProjectRequest,
  GetProjectParams,
  GetProjectsParams,
  Project,
  ProjectSummary,
  UpdateProjectParams,
} from "../features/project/types/project.types";

/**
 * Project一覧を取得する。
 */
export const getProjects = async (
  params: GetProjectsParams,
): Promise<ApiPaginatedResponse<ProjectSummary>> => {
  const response = await apiClient.get<ApiPaginatedResponse<ProjectSummary>>(
    "/projects",
    {
      params,
    },
  );

  return response.data;
};

/**
 * Project詳細を取得する。
 */
export const getProject = async ({
  projectId,
  includeDeleted = false,
}: GetProjectParams): Promise<Project> => {
  const response = await apiClient.get<ApiSuccessResponse<Project>>(
    `/projects/${projectId}`,
    {
      params: {
        includeDeleted,
      },
    },
  );

  return response.data.data;
};

/**
 * Projectを作成する。
 */
export const createProject = async (
  request: CreateProjectRequest,
): Promise<Project> => {
  const response = await apiClient.post<ApiSuccessResponse<Project>>(
    "/projects",
    request,
  );

  return response.data.data;
};

/**
 * Projectを更新する。
 */
export const updateProject = async ({
  projectId,
  request,
}: UpdateProjectParams): Promise<Project> => {
  const response = await apiClient.patch<ApiSuccessResponse<Project>>(
    `/projects/${projectId}`,
    request,
  );

  return response.data.data;
};

/**
 * Projectを論理削除する。
 */
export const deleteProject = async (projectId: number): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};
