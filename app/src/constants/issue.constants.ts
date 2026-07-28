import type { Prisma } from "@prisma/client";
import type { IssueIncludeField } from "../types/issue.types.js";

/**
 * Issue一覧取得で使用可能なソート項目
 */
export const ISSUE_SORT_FIELDS = ["createdAt", "dueDate"] as const;

/**
 * Issue履歴で使用する変更項目
 */
export const ISSUE_HISTORY_FIELDS = {
  DELETED: "deleted",
} as const;

/**
 * Issue取得時にinclude可能な関連データ
 */
export const ISSUE_INCLUDE_FIELDS = [
  "assignee",
  "reporter",
  "comments",
  "project",
] as const;

/**
 * include項目ごとのPrisma Include設定
 */
export const ISSUE_INCLUDE_MAP = {
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

  comments: {
    where: {
      deletedAt: null,
    },

    select: {
      id: true,
      content: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  },

  project: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Record<
  IssueIncludeField,
  Prisma.IssueInclude[keyof Prisma.IssueInclude]
>;

export type IssueSortField = (typeof ISSUE_SORT_FIELDS)[number];
