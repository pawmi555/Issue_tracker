import { IssueDto } from "../../dto/issue/issue.dto.js";

import { IssueMapperInput } from "./issue-mapper.type.js";

/**
 * Issue → IssueDto
 */
export const mapIssue = (
  issue: IssueMapperInput,
  options?: {
    includeDeleted?: boolean;
  },
): IssueDto => {
  const dto: IssueDto = {
    id: issue.id,

    title: issue.title,
    description: issue.description,
    dueDate: issue.dueDate,

    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,

    ...(options?.includeDeleted && {
      deletedAt: issue.deletedAt,
    }),

    status: {
      id: issue.status.id,
      name: issue.status.name,
      label: issue.status.label,
    },

    priority: {
      id: issue.priority.id,
      name: issue.priority.name,
      label: issue.priority.label,
    },
  };
  if (issue.project) {
    dto.project = {
      id: issue.project.id,
      name: issue.project.name,
    };
  }

  if (issue.assignee) {
    dto.assignee = {
      id: issue.assignee.id,
      name: issue.assignee.name,
    };
  }

  if (issue.reporter) {
    dto.reporter = {
      id: issue.reporter.id,
      name: issue.reporter.name,
    };
  }

  if (issue) {
    if (issue.comments) {
      dto.comments = issue.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        user: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }));
    }
  }
  return dto;
};
