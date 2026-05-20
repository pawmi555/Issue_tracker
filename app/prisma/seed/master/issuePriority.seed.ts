import { prisma } from "../../client.js";

export const seedIssuePriorities = async () => {
  const priorities = [
    {
      name: "LOW",
      label: "低",
      sortOrder: 1,
    },
    {
      name: "MEDIUM",
      label: "中",
      sortOrder: 2,
    },
    {
      name: "HIGH",
      label: "高",
      sortOrder: 3,
    },
    {
      name: "CRITICAL",
      label: "緊急・重大障害",
      sortOrder: 4,
    },
  ];

  for (const priority of priorities) {
    await prisma.IssuePriority.upsert({
      where: {
        name: priority.name,
      },
      update: {
        label: priority.label,
        sortOrder: priority.sortOrder,
      },
      create: priority,
    });
  }
};
