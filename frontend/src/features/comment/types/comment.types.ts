import type { IsoDateString } from "../../../types/common";
import type { PaginationParams } from "../../../types/pagination";

export type CommentUser = {
  id: number;
  name: string;
  deletedAt?: IsoDateString | null;
};

export type Comment = {
  id: number;
  content: string;
  user: CommentUser;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  deletedAt?: IsoDateString | null;
};

export type GetCommentsParams = PaginationParams & {
  issueId: number;
  includeDeleted?: boolean;
};

export type CreateCommentRequest = {
  content: string;
};

export type CreateCommentParams = {
  issueId: number;
  request: CreateCommentRequest;
};

export type UpdateCommentRequest = {
  content: string;
};

export type UpdateCommentParams = {
  commentId: number;
  request: UpdateCommentRequest;
};

export type DeleteCommentParams = {
  commentId: number;
  issueId: number;
};
