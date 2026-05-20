import { prisma } from "../../client.js";

export const seedUserRoles = async () => {
  console.log("seed user roles");
  const roles = [
    {
      name: "ADMIN",
      label: "管理者",
    },
    {
      name: "USER",
      label: "一般ユーザー",
    },
  ];

  for (const role of roles) {
    await prisma.userRole.upsert({
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
