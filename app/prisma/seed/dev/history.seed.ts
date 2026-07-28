import { HistoryField, Prisma } from "@prisma/client";

import { prisma } from "../../client.js";

export const seedHistories = async () => {
  console.log("seed issue histories");

  const admin = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  });

  if (!admin) {
    throw new Error("Admin user not found.");
  }

  const project = await prisma.project.findUnique({
    where: {
      ownerId_name: {
        ownerId: admin.id,
        name: "Issue Tracker",
      },
    },
  });

  if (!project) {
    throw new Error("Issue Tracker project not found.");
  }

  const issue = await prisma.issue.findFirst({
    where: {
      projectId: project.id,
      reporterId: admin.id,
      title: {
        in: ["Login Bug", "Login Bug - resolved"],
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const operator = admin;

  const openStatus = await prisma.issueStatus.findUnique({
    where: {
      name: "OPEN",
    },
  });

  const inProgressStatus = await prisma.issueStatus.findUnique({
    where: {
      name: "IN_PROGRESS",
    },
  });

  const reviewStatus = await prisma.issueStatus.findUnique({
    where: {
      name: "REVIEW",
    },
  });

  const doneStatus = await prisma.issueStatus.findUnique({
    where: {
      name: "DONE",
    },
  });

  const highPriority = await prisma.issuePriority.findUnique({
    where: {
      name: "HIGH",
    },
  });

  const criticalPriority = await prisma.issuePriority.findUnique({
    where: {
      name: "CRITICAL",
    },
  });

  const updateAction = await prisma.historyAction.findUnique({
    where: {
      name: "UPDATE",
    },
  });

  const deleteAction = await prisma.historyAction.findUnique({
    where: {
      name: "DELETE",
    },
  });

  const restoreAction = await prisma.historyAction.findUnique({
    where: {
      name: "RESTORE",
    },
  });

  if (
    !issue ||
    !operator ||
    !openStatus ||
    !inProgressStatus ||
    !reviewStatus ||
    !doneStatus ||
    !highPriority ||
    !criticalPriority ||
    !updateAction ||
    !deleteAction ||
    !restoreAction
  ) {
    throw new Error("Required data for issue history seed not found.");
  }

  const baseDate = new Date("2026-07-01T09:00:00.000Z");
  const dueDate = new Date("2026-07-31T00:00:00.000Z");
  const deletedAt = new Date("2026-07-01T20:00:00.000Z");

  const createDate = (hoursAfterBase: number) => {
    return new Date(baseDate.getTime() + hoursAfterBase * 60 * 60 * 1000);
  };

  const histories = [
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_TITLE,
      oldValue: issue.title,
      newValue: "Login Bug investigation",
      createdAt: createDate(0),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_DESCRIPTION,
      oldValue: issue.description ?? Prisma.DbNull,
      newValue: "Investigating login failure with test account",
      createdAt: createDate(1),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_STATUS_ID,
      oldValue: openStatus.id,
      newValue: inProgressStatus.id,
      createdAt: createDate(2),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_PRIORITY_ID,
      oldValue: highPriority.id,
      newValue: criticalPriority.id,
      createdAt: createDate(3),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_DUE_DATE,
      oldValue: Prisma.DbNull,
      newValue: dueDate.toISOString(),
      createdAt: createDate(4),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_TITLE,
      oldValue: "Login Bug investigation",
      newValue: "Login Bug - resolved",
      createdAt: createDate(5),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_DESCRIPTION,
      oldValue: "Investigating login failure with test account",
      newValue: "Fixed authentication failure for test account",
      createdAt: createDate(6),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_STATUS_ID,
      oldValue: inProgressStatus.id,
      newValue: reviewStatus.id,
      createdAt: createDate(7),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_PRIORITY_ID,
      oldValue: criticalPriority.id,
      newValue: highPriority.id,
      createdAt: createDate(8),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: updateAction.id,
      fieldName: HistoryField.ISSUE_STATUS_ID,
      oldValue: reviewStatus.id,
      newValue: doneStatus.id,
      createdAt: createDate(9),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: deleteAction.id,
      fieldName: HistoryField.ISSUE_DELETED_AT,
      oldValue: Prisma.DbNull,
      newValue: deletedAt.toISOString(),
      createdAt: createDate(11),
    },
    {
      issueId: issue.id,
      userId: operator.id,
      actionId: restoreAction.id,
      fieldName: HistoryField.ISSUE_DELETED_AT,
      oldValue: deletedAt.toISOString(),
      newValue: Prisma.DbNull,
      createdAt: createDate(12),
    },
  ] satisfies Prisma.IssueHistoryCreateManyInput[];

  await prisma.$transaction(async (tx) => {
    /*
     * seedを再実行した場合に履歴が重複しないよう、
     * 対象Issueの既存履歴を削除してから登録する。
     */
    await tx.issueHistory.deleteMany({
      where: {
        issueId: issue.id,
      },
    });

    await tx.issueHistory.createMany({
      data: histories,
    });

    /*
     * Historyと現在のIssue状態が矛盾しないように、
     * 12件目まで適用された後の状態へ更新する。
     */
    await tx.issue.update({
      where: {
        id: issue.id,
      },
      data: {
        title: "Login Bug - resolved",
        description: "Fixed authentication failure for test account",
        statusId: doneStatus.id,
        priorityId: highPriority.id,
        dueDate,
        deletedAt: null,
      },
    });
  });

  const createdHistories = await prisma.issueHistory.findMany({
    where: {
      issueId: issue.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (createdHistories.length !== 12) {
    throw new Error(
      `Expected 12 issue histories, but found ${createdHistories.length}.`,
    );
  }

  console.log(
    `Created ${createdHistories.length} histories for Issue ${issue.id}.`,
  );
};
