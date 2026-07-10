import { prisma } from "../../client.js";

export const seedProjects = async () => {
  const adminUser = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  });

  const ownerRole = await prisma.projectRole.findUnique({
    where: {
      name: "OWNER",
    },
  });

  if (!adminUser) {
    throw new Error("Admin user not found.");
  }

  if (!ownerRole) {
    throw new Error("Owner role not found.");
  }

  await prisma.project.upsert({
    where: {
      ownerId_name: {
        ownerId: adminUser.id,
        name: "Issue Tracker",
      },
    },
    update: {},
    create: {
      ownerId: adminUser.id,
      name: "Issue Tracker",
      description: "Sample project",
      members: {
        create: {
          user: {
            connect: {
              id: adminUser.id,
            },
          },
          role: {
            connect: {
              name: "OWNER",
            },
          },
        },
      },
    },
  });

  await prisma.project.upsert({
    where: {
      ownerId_name: {
        ownerId: adminUser.id,
        name: "Issue Tracker Deleted",
      },
    },
    update: {},
    create: {
      ownerId: adminUser.id,
      name: "Issue Tracker Deleted",
      description: "Deleted project",
      deletedAt: new Date(),
      members: {
        create: {
          user: {
            connect: {
              id: adminUser.id,
            },
          },
          role: {
            connect: {
              name: "OWNER",
            },
          },
        },
      },
    },
  });
};
