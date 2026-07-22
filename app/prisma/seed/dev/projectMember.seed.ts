import { prisma } from "../../client.js";

export const seedProjectMembers = async () => {
  const admin = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  });

  const owner = await prisma.user.findUnique({
    where: {
      email: "owner@example.com",
    },
  });

  const manager = await prisma.user.findUnique({
    where: {
      email: "manager@example.com",
    },
  });

  const member = await prisma.user.findUnique({
    where: {
      email: "user@example.com",
    },
  });

  const viewer = await prisma.user.findUnique({
    where: {
      email: "viewer@example.com",
    },
  });

  const issueTrackerProject = await prisma.project.findFirst({
    where: {
      name: "Issue Tracker",
      ownerId: admin?.id,
    },
  });

  const deletedIssueTrackerProject = await prisma.project.findFirst({
    where: {
      name: "Issue Tracker Deleted",
      ownerId: admin?.id,
    },
  });

  const ownerTestProject = await prisma.project.findFirst({
    where: {
      name: "Owner Test Project",
      ownerId: owner?.id,
    },
  });

  const ownerRole = await prisma.projectRole.findUnique({
    where: {
      name: "OWNER",
    },
  });

  const managerRole = await prisma.projectRole.findUnique({
    where: {
      name: "MANAGER",
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

  if (
    !admin ||
    !owner ||
    !manager ||
    !member ||
    !viewer ||
    !issueTrackerProject ||
    !deletedIssueTrackerProject ||
    !ownerTestProject ||
    !ownerRole ||
    !managerRole ||
    !memberRole ||
    !viewerRole
  ) {
    throw new Error("Required project member seed data not found.");
  }

  const memberships = [
    {
      projectId: issueTrackerProject.id,
      userId: admin.id,
      roleId: ownerRole.id,
    },
    {
      projectId: deletedIssueTrackerProject.id,
      userId: admin.id,
      roleId: ownerRole.id,
    },
    {
      projectId: issueTrackerProject.id,
      userId: manager.id,
      roleId: managerRole.id,
    },
    {
      projectId: issueTrackerProject.id,
      userId: member.id,
      roleId: memberRole.id,
    },
    {
      projectId: issueTrackerProject.id,
      userId: viewer.id,
      roleId: viewerRole.id,
    },
    {
      projectId: ownerTestProject.id,
      userId: owner.id,
      roleId: ownerRole.id,
    },
  ];

  for (const membership of memberships) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: membership.projectId,
          userId: membership.userId,
        },
      },
      update: {
        roleId: membership.roleId,
      },
      create: membership,
    });
  }
};
