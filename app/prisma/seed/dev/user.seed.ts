import bcrypt from "bcrypt";

import { prisma } from "../../client.js";

export const seedUsers = async () => {
  const adminRole = await prisma.userRole.findUnique({
    where: {
      name: "ADMIN",
    },
  });

  const userRole = await prisma.userRole.findUnique({
    where: {
      name: "USER",
    },
  });

  if (!adminRole || !userRole) {
    throw new Error("User roles not found.");
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "user@example.com",
    },
    update: {},
    create: {
      name: "Test User",
      email: "user@example.com",
      passwordHash,
      roleId: userRole.id,
    },
  });
};
