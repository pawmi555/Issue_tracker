import type { IssuePriority, IssueStatus } from "../types/issue.types";

export const ISSUE_STATUSES: IssueStatus[] = [
  {
    id: 1,
    name: "OPEN",
    label: "未着手",
  },
  {
    id: 2,
    name: "IN_PROGRESS",
    label: "対応中",
  },
  {
    id: 3,
    name: "REVIEW",
    label: "レビュー待ち",
  },
  {
    id: 4,
    name: "DONE",
    label: "作業完了",
  },
  {
    id: 5,
    name: "CLOSED",
    label: "完全終了",
  },
];

export const ISSUE_PRIORITIES: IssuePriority[] = [
  {
    id: 1,
    name: "LOW",
    label: "低",
  },
  {
    id: 2,
    name: "MEDIUM",
    label: "中",
  },
  {
    id: 3,
    name: "HIGH",
    label: "高",
  },
  {
    id: 4,
    name: "CRITICAL",
    label: "緊急・重大障害",
  },
];
