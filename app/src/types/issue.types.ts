import { ISSUE_INCLUDE_FIELDS } from "../constants/issue.constants.js";
import { IssueSortField } from "../constants/issue.constants.js";

/**
 * 利用可能なIssue include項目を表すUnion型
 */
export type IssueIncludeField = (typeof ISSUE_INCLUDE_FIELDS)[number];

export type CreateIssueInput = {
  projectId: number;
  userId: number;

  data: {
    title: string;
    description?: string;
    priorityId: number;
    assigneeId?: number;
    dueDate?: Date;
  };
};

export type GetIssuesInput = {
  projectId: number;
  userId: number;
  includeDeleted?: boolean;

  query: {
    page?: number;
    limit?: number;
    statusId?: number;
    priorityId?: number;
    assigneeId?: number;
    keyword?: string;
    sort?: IssueSortField;
    order?: "asc" | "desc";
    include?: string;
  };
};

export type UpdateIssueInput = {
  issueId: number;
  userId: number;

  data: {
    title?: string;
    description?: string | null;
    statusId?: number;
    priorityId?: number;
    assigneeId?: number | null;
    dueDate?: Date | null;
  };
};

export type GetIssueDetailInput = {
  issueId: number;
  userId: number;
  includeDeleted?: boolean;

  query: {
    page?: number;
    limit?: number;
    statusId?: number;
    priorityId?: number;
    assigneeId?: number;
    keyword?: string;
    sort?: IssueSortField;
    order?: "asc" | "desc";
    include?: string;
  };
};

export type DeleteIssueInput = {
  issueId: number;
  userId: number;
};

export type RestoreIssueInput = {
  issueId: number;
  userId: number;
};
