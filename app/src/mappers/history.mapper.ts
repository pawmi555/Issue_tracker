import type { Prisma } from "@prisma/client";
import { HistoryField } from "@prisma/client";

export type MasterMap = {
  status: Record<number, string>;
  priority: Record<number, string>;
};

export type HistoryRecord = Prisma.IssueHistoryGetPayload<{
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
}>;

const FIELD_MAP: Record<HistoryField, string> = {
  ISSUE_TITLE: "title",
  ISSUE_DESCRIPTION: "description",
  ISSUE_STATUS_ID: "status",
  ISSUE_PRIORITY_ID: "priority",
  ISSUE_ASSIGNEE_ID: "assignee",
  ISSUE_DUE_DATE: "dueDate",
} satisfies Record<HistoryField, string>;

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
 * Issue履歴をAPIレスポンスDTOへ変換する
 *
 * 内部フィールド名および内部値をAPI公開用形式へ変換して返却する。
 */
export const mapIssueHistory = (history: HistoryRecord, masters: MasterMap) => {
  return {
    action: history.action.name,

    field: mapField(history.fieldName),

    oldValue: mapValue(history.fieldName, history.oldValue, masters),

    newValue: mapValue(history.fieldName, history.newValue, masters),

    changedBy: {
      id: history.user.id,
      name: history.user.name,
    },

    createdAt: history.createdAt,
  };
};
