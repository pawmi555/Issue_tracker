import type { IsoDateString } from "../../../types/common";
import type { PaginationParams } from "../../../types/pagination";

export type ProjectRoleName = "OWNER" | "MANAGER" | "MEMBER" | "VIEWER";

export type ProjectRole = {
  id: number;
  name: ProjectRoleName;
  label: string;
};

export type UserSummary = {
  id: number;
  name: string;
  deletedAt?: IsoDateString | null;
};

export type ProjectCount = {
  members: number;
  issues: number;
};

export type ProjectMember = {
  id: number;
  role: ProjectRole;
  user: UserSummary;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type ProjectSummary = {
  id: number;
  name: string;
  description: string | null;
  owner: UserSummary;
  counts: ProjectCount;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  deletedAt?: IsoDateString | null;
};

export type Project = ProjectSummary & {
  ownerId: number;
  members: ProjectMember[];
};

export type ProjectSort = "createdAt";

export type SortOrder = "asc" | "desc";

export type GetProjectsParams = PaginationParams & {
  sort?: ProjectSort;
  order?: SortOrder;
  includeDeleted?: boolean;
};

export type GetProjectParams = {
  projectId: number;
  includeDeleted?: boolean;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
};

export type UpdateProjectRequest = {
  name?: string;
  description?: string;
};

export type UpdateProjectParams = {
  projectId: number;
  request: UpdateProjectRequest;
};
