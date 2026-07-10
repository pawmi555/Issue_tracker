import { Prisma } from "@prisma/client";
import { ISSUE_INCLUDE_MAP } from "../constants/issue.constants.js";
import { validateIssueIncludes } from "../validators/issue-include.validator.js";
import { parseInclude } from "../utils/include-parser.js";
import { IssueIncludeField } from "../types/issue.types.js";

/**
 * Issue共通項目
 */
export const issueBaseSelect = {
  id: true,

  title: true,
  description: true,
  dueDate: true,

  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  status: {
    select: {
      id: true,
      name: true,
      label: true,
    },
  },

  priority: {
    select: {
      id: true,
      name: true,
      label: true,
    },
  },
} satisfies Prisma.IssueSelect;

/**
 * Issue一覧用
 */
export const issueSummarySelect = {
  id: true,

  title: true,

  dueDate: true,

  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.IssueSelect;

/**
 * Issue一覧(include)用
 */
export const issueSummaryWithRelationSelect = {
  ...issueSummarySelect,

  project: {
    select: {
      id: true,
      name: true,
    },
  },

  assignee: {
    select: {
      id: true,
      name: true,
    },
  },

  reporter: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.IssueSelect;

/**
 * Issue履歴比較用
 */
export const issueHistorySelect = {
  id: true,

  projectId: true,
  assigneeId: true,

  title: true,
  description: true,
  dueDate: true,

  statusId: true,
  priorityId: true,

  project: {
    select: {
      deletedAt: true,
    },
  },

  status: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.IssueSelect;

/**
 * Issue詳細・作成・更新用
 */
export const issueDtoSelect = issueBaseSelect;

/**
 * 指定されたinclude項目からPrisma Issue Include設定を生成する
 */
export const buildIssueRelationSelect = (
  include?: string,
  allowComments = false,
): IssueRelationSelect => {
  const includes = parseInclude(include);

  validateIssueIncludes(includes, allowComments);

  const result: IssueRelationSelect = {};

  for (const field of includes) {
    result[field] = ISSUE_INCLUDE_MAP[field];
  }

  return result;
};

type IssueRelationSelect = Partial<Pick<Prisma.IssueSelect, IssueIncludeField>>;
