import { prisma } from "../../client.js";

export const seedProjectMembers = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: "user@example.com",
    },
  });

  const project = await prisma.project.findFirst({
    where: {
      name: "Issue Tracker",
    },
  });
  const memberRole = await prisma.projectRole.findUnique({
    where: {
      name: "MEMBER",
    },
  });

  if (!user || !project || !memberRole) {
    throw new Error("Required data not found.");
  }
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      projectId: project.id,
      roleId: memberRole.id,
    },
  });
};
