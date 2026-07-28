import apiClient from "./axios";

import type { ApiPaginatedResponse, ApiSuccessResponse } from "../types/api";

import type {
  Comment,
  CreateCommentParams,
  DeleteCommentParams,
  GetCommentsParams,
  UpdateCommentParams,
} from "../features/comment/types/comment.types";

const buildCommentListParams = ({
  issueId: _issueId,
  ...params
}: GetCommentsParams) => params;

/**
 * Comment一覧を取得する。
 */
export const getComments = async (
  params: GetCommentsParams,
): Promise<ApiPaginatedResponse<Comment>> => {
  const response = await apiClient.get<ApiPaginatedResponse<Comment>>(
    `/issues/${params.issueId}/comments`,
    {
      params: buildCommentListParams(params),
    },
  );

  return response.data;
};

/**
 * Commentを投稿する。
 */
export const createComment = async ({
  issueId,
  request,
}: CreateCommentParams): Promise<Comment> => {
  const response = await apiClient.post<ApiSuccessResponse<Comment>>(
    `/issues/${issueId}/comments`,
    request,
  );

  return response.data.data;
};

/**
 * Commentを更新する。
 */
export const updateComment = async ({
  commentId,
  request,
}: UpdateCommentParams): Promise<Comment> => {
  const response = await apiClient.patch<ApiSuccessResponse<Comment>>(
    `/comments/${commentId}`,
    request,
  );

  return response.data.data;
};

/**
 * Commentを論理削除する。
 */
export const deleteComment = async ({
  commentId,
}: DeleteCommentParams): Promise<void> => {
  await apiClient.delete(`/comments/${commentId}`);
};
