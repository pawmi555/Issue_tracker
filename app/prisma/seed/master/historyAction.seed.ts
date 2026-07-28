import { prisma } from "../../client.js";

export const seedHistoryAction = async () => {
  console.log("seed history action");
  const actions = [
    {
      name: "UPDATE",
      label: "更新",
      sortOrder: 1,
    },
    {
      name: "DELETE",
      label: "削除",
      sortOrder: 2,
    },
    {
      name: "RESTORE",
      label: "復元",
      sortOrder: 3,
    },
  ];

  for (const action of actions) {
    await prisma.historyAction.upsert({
      where: {
        name: action.name,
      },
      update: {
        label: action.label,
        sortOrder: action.sortOrder,
      },
      create: action,
    });
  }
};
