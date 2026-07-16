import { ISSUE_STATUSES } from "../constants/issue.constants";

import type { IssueStatus, IssueStatusName } from "../types/issue.types";

const nextStatusMap: Record<IssueStatusName, IssueStatusName | null> = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "REVIEW",
  REVIEW: "DONE",
  DONE: "CLOSED",
  CLOSED: null,
};

export const getNextIssueStatus = (
  currentStatus: IssueStatusName,
): IssueStatus | null => {
  const nextStatusName = nextStatusMap[currentStatus];

  if (!nextStatusName) {
    return null;
  }

  return ISSUE_STATUSES.find(({ name }) => name === nextStatusName) ?? null;
};
