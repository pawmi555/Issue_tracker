import bcrypt from "bcrypt";

import { prisma } from "../../client.js";

const SEED_PASSWORD = "password123";

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

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      roleId: adminRole.id,
    },
    {
      name: "Owner User",
      email: "owner@example.com",
      roleId: userRole.id,
    },
    {
      name: "Manager User",
      email: "manager@example.com",
      roleId: userRole.id,
    },
    {
      name: "Member User",
      email: "user@example.com",
      roleId: userRole.id,
    },
    {
      name: "Viewer User",
      email: "viewer@example.com",
      roleId: userRole.id,
    },
    {
      name: "Outsider User",
      email: "outsider@example.com",
      roleId: userRole.id,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        passwordHash,
        roleId: user.roleId,
        deletedAt: null,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        roleId: user.roleId,
      },
    });
  }
};
