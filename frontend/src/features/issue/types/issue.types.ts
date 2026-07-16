import type { IsoDateString } from "../../../types/common";
import type { PaginationParams } from "../../../types/pagination";

export type IssueStatusName =
  "OPEN" | "IN_PROGRESS" | "REVIEW" | "DONE" | "CLOSED";

export type IssuePriorityName = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IssueStatus = {
  id: number;
  name: IssueStatusName;
  label: string;
};

export type IssuePriority = {
  id: number;
  name: IssuePriorityName;
  label: string;
};

export type IssueUserSummary = {
  id: number;
  name: string;
};

export type IssueProjectReference = {
  id: number;
  name: string;
};

export type IssueComment = {
  id: number;
  content: string;
  user: IssueUserSummary;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type IssueSummary = {
  id: number;
  title: string;
  dueDate: IsoDateString | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  deletedAt?: IsoDateString | null;

  project?: IssueProjectReference | null;
  assignee?: IssueUserSummary | null;
  reporter?: IssueUserSummary | null;
};

export type Issue = IssueSummary & {
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  comments?: IssueComment[];
};

export type IssueSort = "createdAt" | "dueDate";
export type SortOrder = "asc" | "desc";

export type GetIssuesParams = PaginationParams & {
  projectId: number;
  statusId?: number;
  priorityId?: number;
  assigneeId?: number;
  keyword?: string;
  sort?: IssueSort;
  order?: SortOrder;
  include?: string;
  includeDeleted?: boolean;
};

export type GetIssueParams = {
  issueId: number;
  include?: string;
  includeDeleted?: boolean;
};

export type CreateIssueRequest = {
  title: string;
  description?: string;
  priorityId: number;
  assigneeId?: number;
  dueDate?: string;
};

export type CreateIssueParams = {
  projectId: number;
  request: CreateIssueRequest;
};

export type UpdateIssueRequest = {
  title?: string;
  description?: string | null;
  statusId?: number;
  priorityId?: number;
  assigneeId?: number | null;
  dueDate?: string | null;
};

export type UpdateIssueParams = {
  issueId: number;
  request: UpdateIssueRequest;
};
