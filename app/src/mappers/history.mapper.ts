import type { Prisma } from "@prisma/client";
import { HistoryField } from "@prisma/client";

type MasterMap = {
  status: Record<number, string>;
  priority: Record<number, string>;
};

type HistoryRecord = Prisma.IssueHistoryGetPayload<{
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

export const mapIssueHistory = async (
  history: HistoryRecord,
  masters?: MasterMap,
) => {
  let oldValue = history.oldValue;
  let newValue = history.newValue;

  if (history.fieldName === "STATUS_ID") {
    oldValue =
      typeof oldValue === "number"
        ? (masters?.status[oldValue] ?? null)
        : oldValue;

    newValue =
      typeof newValue === "number"
        ? (masters?.status[newValue] ?? null)
        : newValue;
  }

  if (history.fieldName === "PRIORITY_ID") {
    oldValue =
      typeof oldValue === "number"
        ? (masters?.priority[oldValue] ?? null)
        : oldValue;

    newValue =
      typeof newValue === "number"
        ? (masters?.priority[newValue] ?? null)
        : newValue;
  }

  return {
    action: history.action.name,
    fieldName: history.fieldName.toLowerCase(),
    oldValue,
    newValue,
    changedBy: {
      id: history.user.id,
      name: history.user.name,
    },
    createdAt: history.createdAt,
  };
};
