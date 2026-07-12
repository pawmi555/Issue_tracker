import { prisma } from "../../client.js";

export const seedProjectRoles = async () => {
  const roles = [
    {
      name: "OWNER",
      label: "プロジェクト作成者。全権限",
    },
    {
      name: "MANAGER",
      label: "メンバー管理・Issue管理が可能",
    },
    {
      name: "MEMBER",
      label: "Issue作成・更新・コメント可能",
    },
    {
      name: "VIEWER",
      label: "閲覧のみ",
    },
  ];

  for (const role of roles) {
    await prisma.projectRole.upsert({
      where: {
        name: role.name,
      },
      update: {
        label: role.label,
      },
      create: role,
    });
  }
};
