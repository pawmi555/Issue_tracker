import { prisma } from "../../client.js";

export const seedProjectMembers = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: "user@example.com",
    },
  });

  const viewer = await prisma.user.findUnique({
    where: {
      email: "viewer@example.com",
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

  const viewerRole = await prisma.projectRole.findUnique({
    where: {
      name: "VIEWER",
    },
  });

  if (!user || !viewer || !project || !memberRole || !viewerRole) {
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

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: viewer.id,
      },
    },
    update: {},
    create: {
      userId: viewer.id,
      projectId: project.id,
      roleId: viewerRole.id,
    },
  });
};
