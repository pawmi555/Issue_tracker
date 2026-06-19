import { ISSUE_INCLUDE_FIELDS } from "../constants/issue.constants.js";
import { IssueSortField } from "../constants/issue.constants.js";

/**
 * 利用可能なIssue include項目を表すUnion型
 */
export type IssueIncludeField = (typeof ISSUE_INCLUDE_FIELDS)[number];

export type GetIssuesInput = {
  projectId: number;
  userId: number;

  query: {
    page?: number;
    limit?: number;
    statusId?: number;
    priorityId?: number;
    assigneeId?: number;
    keyword?: string;
    sort?: IssueSortField;
    order?: "asc" | "desc";
    include?: IssueIncludeField[];
  };
};
