import apiClient from "./axios";

import type { ApiPaginatedResponse, ApiSuccessResponse } from "../types/api";

import type {
  CreateIssueParams,
  GetIssueParams,
  GetIssuesParams,
  Issue,
  IssueSummary,
  UpdateIssueParams,
} from "../features/issue/types/issue.types";

const buildIssueListParams = ({
  projectId: _projectId,
  ...params
}: GetIssuesParams) => params;

export const getIssues = async (
  params: GetIssuesParams,
): Promise<ApiPaginatedResponse<IssueSummary>> => {
  const response = await apiClient.get<ApiPaginatedResponse<IssueSummary>>(
    `/projects/${params.projectId}/issues`,
    {
      params: buildIssueListParams(params),
    },
  );

  return response.data;
};

export const getIssue = async ({
  issueId,
  include,
  includeDeleted = false,
}: GetIssueParams): Promise<Issue> => {
  const response = await apiClient.get<ApiSuccessResponse<Issue>>(
    `/issues/${issueId}`,
    {
      params: {
        include,
        includeDeleted,
      },
    },
  );

  return response.data.data;
};

export const createIssue = async ({
  projectId,
  request,
}: CreateIssueParams): Promise<Issue> => {
  const response = await apiClient.post<ApiSuccessResponse<Issue>>(
    `/projects/${projectId}/issues`,
    request,
  );

  return response.data.data;
};

export const updateIssue = async ({
  issueId,
  request,
}: UpdateIssueParams): Promise<Issue> => {
  const response = await apiClient.patch<ApiSuccessResponse<Issue>>(
    `/issues/${issueId}`,
    request,
  );

  return response.data.data;
};

export const deleteIssue = async (issueId: number): Promise<void> => {
  await apiClient.delete(`/issues/${issueId}`);
};

export const restoreIssue = async (issueId: number): Promise<void> => {
  await apiClient.post(`/issues/${issueId}/restore`);
};
