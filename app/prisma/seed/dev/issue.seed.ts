import { prisma } from "../../client.js";

export const seedIssues = async () => {
  const project = await prisma.project.findFirst({
    where: {
      name: "Issue Tracker",
    },
  });

  const reporter = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  });

  const assignee = await prisma.user.findUnique({
    where: {
      email: "user@example.com",
    },
  });

  const openStatus = await prisma.issueStatus.findUnique({
    where: {
      name: "OPEN",
    },
  });

  const highPriority = await prisma.issuePriority.findUnique({
    where: {
      name: "HIGH",
    },
  });

  if (!project || !reporter || !assignee || !openStatus || !highPriority) {
    throw new Error("Required data not found.");
  }

  await prisma.issue.create({
    data: {
      title: "Login Bug",
      description: "Cannot login with test account",
      projectId: project.id,
      reporterId: reporter.id,
      assigneeId: assignee.id,
      statusId: openStatus.id,
      priorityId: highPriority.id,
    },
  });
};
