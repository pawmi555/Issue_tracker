import { prisma } from "../../client.js";

const INITIAL_TITLE = "Login Bug";
const SEEDED_TITLE = "Login Bug - resolved";

export const seedIssues = async () => {
  const admin = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  });

  const reporter = admin;

  const assignee = await prisma.user.findUnique({
    where: {
      email: "user@example.com",
    },
  });

  if (!admin || !reporter || !assignee) {
    throw new Error("Required issue users not found.");
  }

  const project = await prisma.project.findUnique({
    where: {
      ownerId_name: {
        ownerId: admin.id,
        name: "Issue Tracker",
      },
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

  if (!project || !openStatus || !highPriority) {
    throw new Error("Required issue seed data not found.");
  }

  const existingIssue = await prisma.issue.findFirst({
    where: {
      projectId: project.id,
      reporterId: reporter.id,
      title: {
        in: [INITIAL_TITLE, SEEDED_TITLE],
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  if (existingIssue) {
    await prisma.issue.update({
      where: {
        id: existingIssue.id,
      },
      data: {
        title: INITIAL_TITLE,
        description: "Cannot login with test account",
        reporterId: reporter.id,
        assigneeId: assignee.id,
        statusId: openStatus.id,
        priorityId: highPriority.id,
        dueDate: null,
        deletedAt: null,
      },
    });

    return;
  }

  await prisma.issue.create({
    data: {
      title: INITIAL_TITLE,
      description: "Cannot login with test account",
      projectId: project.id,
      reporterId: reporter.id,
      assigneeId: assignee.id,
      statusId: openStatus.id,
      priorityId: highPriority.id,
    },
  });
};
