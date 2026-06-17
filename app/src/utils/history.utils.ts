import { HistoryField } from "@prisma/client";

type UserBefore = {
  name: string;
  email: string;
  roleId: number;
};

type ProjectBefore = {
  name: string;
  description: string | null;
};

type IssueBefore = {
  title: string;
  description: string | null;
  statusId: number;
  priorityId: number;
  assigneeId: number | null;
  dueDate: Date | null;
};

type CommentBefore = {
  content: string;
};

type UserUpdateInput = Partial<UserBefore>;
type ProjectUpdateInput = Partial<ProjectBefore>;
type IssueUpdateInput = Partial<IssueBefore>;
type CommentUpdateInput = Partial<CommentBefore>;

export const buildUserHistories = ({
  before,
  after,
  userId,
  operatedBy,
  actionId,
}: {
  before: UserBefore;
  after: UserUpdateInput;
  userId: number;
  operatedBy: number;
  actionId: number;
}) => {
  const histories = [];

  if (after.name !== undefined && after.name !== before.name) {
    histories.push({
      userId,
      operatedBy,
      actionId,

      fieldName: HistoryField.NAME,

      oldValue: before.name,
      newValue: after.name,
    });
  }

  if (after.email !== undefined && after.email !== before.email) {
    histories.push({
      userId,
      operatedBy,
      actionId,

      fieldName: HistoryField.EMAIL,

      oldValue: before.email,
      newValue: after.email,
    });
  }

  if (after.roleId !== undefined && after.roleId !== before.roleId) {
    histories.push({
      userId,
      operatedBy,
      actionId,

      fieldName: HistoryField.ROLE,

      oldValue: String(before.roleId),
      newValue: String(after.roleId),
    });
  }

  return histories;
};

export const buildProjectHistories = ({
  before,
  after,
  projectId,
  userId,
  actionId,
}: {
  before: ProjectBefore;
  after: ProjectUpdateInput;
  projectId: number;
  userId: number;
  actionId: number;
}) => {
  const rows = [];

  const mappings = [
    ["name", HistoryField.NAME],
    ["description", HistoryField.DESCRIPTION],
  ] as const;

  for (const [key, field] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    if (oldValue === newValue) {
      continue;
    }

    rows.push({
      projectId,
      userId,
      actionId,
      fieldName: field,
      oldValue,
      newValue,
    });
  }

  return rows;
};

export const buildIssueHistories = ({
  before,
  after,
  issueId,
  userId,
  actionId,
}: {
  before: IssueBefore;
  after: IssueUpdateInput;
  issueId: number;
  userId: number;
  actionId: number;
}) => {
  const rows = [];

  const mappings = [
    ["title", HistoryField.TITLE],
    ["description", HistoryField.DESCRIPTION],
    ["statusId", HistoryField.STATUS_ID],
    ["priorityId", HistoryField.PRIORITY_ID],
    ["assigneeId", HistoryField.ASSIGNEE_ID],
    ["dueDate", HistoryField.DUE_DATE],
  ] as const;

  for (const [key, field] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    const isEqual =
      oldValue instanceof Date && newValue instanceof Date
        ? oldValue.getTime() === newValue.getTime()
        : oldValue === newValue;

    if (isEqual) {
      continue;
    }

    rows.push({
      issueId,
      userId,
      actionId,
      fieldName: field,
      oldValue,
      newValue,
    });
  }

  return rows;
};

export const buildCommentHistories = ({
  before,
  after,
  commentId,
  userId,
  actionId,
}: {
  before: CommentBefore;
  after: CommentUpdateInput;
  commentId: number;
  userId: number;
  actionId: number;
}) => {
  const rows = [];

  const mappings = [["content", HistoryField.CONTENT]] as const;

  for (const [key, field] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    if (oldValue === newValue) {
      continue;
    }

    rows.push({
      commentId,
      userId,
      actionId,
      fieldName: field,
      oldValue,
      newValue,
    });
  }

  return rows;
};
