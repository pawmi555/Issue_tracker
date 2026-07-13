import type { Prisma } from "@prisma/client";
import type { HistoryField } from "@prisma/client";
import type { HistoryFieldDto } from "../../dto/history/history-field.dto.js";
import type { HistoryDto } from "../../dto/history/history.dto.js";
import type { HistoryActionDto } from "../../dto/history/history-action.dto.js";

export type MasterMap = {
  status: Record<number, string>;
  priority: Record<number, string>;
};

type HistoryInclude = {
  include: {
    action: {
      select: {
        name: true;
      };
    };

    user: {
      select: {
        id: true;
        name: true;
      };
    };
  };
};

export type UserHistoryRecord = Prisma.UserHistoryGetPayload<HistoryInclude>;

export type ProjectHistoryRecord =
  Prisma.ProjectHistoryGetPayload<HistoryInclude>;

export type IssueHistoryRecord = Prisma.IssueHistoryGetPayload<HistoryInclude>;

export type CommentHistoryRecord =
  Prisma.CommentHistoryGetPayload<HistoryInclude>;

export type HistoryRecord =
  | UserHistoryRecord
  | ProjectHistoryRecord
  | IssueHistoryRecord
  | CommentHistoryRecord;

const FIELD_MAP: Record<HistoryField, HistoryFieldDto> = {
  USER_NAME: "name",
  USER_EMAIL: "email",
  USER_ROLE: "role",

  PROJECT_NAME: "project",
  PROJECT_DESCRIPTION: "description",

  ISSUE_TITLE: "title",
  ISSUE_DESCRIPTION: "description",
  ISSUE_STATUS_ID: "status",
  ISSUE_PRIORITY_ID: "priority",
  ISSUE_ASSIGNEE_ID: "assignee",
  ISSUE_DUE_DATE: "dueDate",
  ISSUE_DELETED_AT: "deletedAt",

  COMMENT_CONTENT: "content",
};

/**
 * 内部フィールド名を公開用フィールド名へ変換する
 */
const mapField = (fieldName: HistoryField) => {
  return FIELD_MAP[fieldName];
};

/**
 * 履歴値を表示用形式へ変換する
 *
 * マスタ参照値は名称へ変換し、nullはそのまま返却する。
 * 変換対象外は元値を返却する。
 */
const mapValue = (
  fieldName: HistoryField,
  value: HistoryRecord["oldValue"],
  masters?: MasterMap,
) => {
  if (value == null) {
    return null;
  }

  switch (fieldName) {
    case "ISSUE_STATUS_ID":
      return typeof value === "number"
        ? (masters?.status[value] ?? null)
        : value;

    case "ISSUE_PRIORITY_ID":
      return typeof value === "number"
        ? (masters?.priority[value] ?? null)
        : value;

    default:
      return value;
  }
};

/**
 * 履歴をAPIレスポンスDTOへ変換する
 *
 * 内部フィールド名および内部値をAPI公開用形式へ変換して返却する。
 */
const mapHistory = (
  history: HistoryRecord,
  masters?: MasterMap,
): HistoryDto => ({
  action: history.action.name as HistoryActionDto,

  field: mapField(history.fieldName),

  oldValue: mapValue(history.fieldName, history.oldValue, masters),

  newValue: mapValue(history.fieldName, history.newValue, masters),

  changedBy: {
    id: history.user.id,
    name: history.user.name,
  },

  createdAt: history.createdAt,
});

export const mapIssueHistory = (h: HistoryRecord, masters: MasterMap) =>
  mapHistory(h, masters);

export const mapUserHistory = mapHistory;

export const mapProjectHistory = mapHistory;

export const mapCommentHistory = mapHistory;
