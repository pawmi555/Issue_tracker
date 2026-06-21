import { Prisma } from "@prisma/client";
import { IssueDto } from "../dto/issue.dto.js";

type IssueMapperInput = {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  status?: {
    id: number;
    name: string;
    label: string;
  };

  priority?: {
    id: number;
    name: string;
    label: string;
  };

  project?: {
    id: number;
    name: string;
  };

  assignee?: {
    id: number;
    name: string;
  } | null;

  reporter?: {
    id: number;
    name: string;
  };

  comments?: {
    id: number;
    content: string;
  }[];
};

export const toIssueDto = (issue: IssueMapperInput): IssueDto => {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    dueDate: issue.dueDate,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,

    ...(issue.status && {
      status: {
        id: issue.status.id,
        name: issue.status.name,
        label: issue.status.label,
      },
    }),

    ...(issue.priority && {
      priority: {
        id: issue.priority.id,
        name: issue.priority.name,
        label: issue.priority.label,
      },
    }),

    ...(issue.project && {
      project: {
        id: issue.project.id,
        name: issue.project.name,
      },
    }),

    ...(issue.assignee && {
      assignee: {
        id: issue.assignee.id,
        name: issue.assignee.name,
      },
    }),

    ...(issue.reporter && {
      reporter: {
        id: issue.reporter.id,
        name: issue.reporter.name,
      },
    }),

    ...(issue.comments && {
      comments: issue.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
      })),
    }),
  };
};
