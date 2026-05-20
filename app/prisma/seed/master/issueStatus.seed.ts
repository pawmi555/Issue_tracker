import { prisma } from "../../client.js";

export const seedIssueStatuses = async () => {
  const statuses = [
    {
      name: "OPEN",
      label: "未着手",
      sortOrder: 1,
    },
    {
      name: "IN_PROGRESS",
      label: "対応中",
      sortOrder: 2,
    },
    {
      name: "REVIEW",
      label: "レビュー待ち",
      sortOrder: 3,
    },
    {
      name: "DONE",
      label: "作業完了",
      sortOrder: 4,
    },
    {
      name: "CLOSED",
      label: "完全終了（変更不可）",
      sortOrder: 5,
    },
  ];

  for (const status of statuses) {
    await prisma.IssueStatus.upsert({
      where: {
        name: status.name,
      },
      update: {
        label: status.label,
        sortOrder: status.sortOrder,
      },
      create: status,
    });
  }
};
