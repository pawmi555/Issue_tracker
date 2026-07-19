import { prisma } from "../../client.js";

export const seedProjects = async () => {
  const adminUser = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  });

  const ownerUser = await prisma.user.findUnique({
    where: {
      email: "owner@example.com",
    },
  });

  if (!adminUser || !ownerUser) {
    throw new Error("Project owners not found.");
  }

  await prisma.project.upsert({
    where: {
      ownerId_name: {
        ownerId: adminUser.id,
        name: "Issue Tracker",
      },
    },
    update: {
      description: "Sample project",
      deletedAt: null,
    },
    create: {
      ownerId: adminUser.id,
      name: "Issue Tracker",
      description: "Sample project",
    },
  });

  await prisma.project.upsert({
    where: {
      ownerId_name: {
        ownerId: ownerUser.id,
        name: "Owner Test Project",
      },
    },
    update: {
      description: "Project for OWNER permission testing",
      deletedAt: null,
    },
    create: {
      ownerId: ownerUser.id,
      name: "Owner Test Project",
      description: "Project for OWNER permission testing",
    },
  });

  await prisma.project.upsert({
    where: {
      ownerId_name: {
        ownerId: adminUser.id,
        name: "Issue Tracker Deleted",
      },
    },
    update: {
      description: "Deleted project",
      deletedAt: new Date(),
    },
    create: {
      ownerId: adminUser.id,
      name: "Issue Tracker Deleted",
      description: "Deleted project",
      deletedAt: new Date(),
    },
  });
};
