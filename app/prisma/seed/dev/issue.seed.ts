import { prisma } from "../../client.js";

const INITIAL_TITLE = "Login Bug";
const SEEDED_TITLE = "Login Bug - resolved";

const DELETED_PROJECT_ISSUE_TITLE = "Issue in Deleted Project";

export const seedIssues = async () => {
  const admin = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  });

  const assignee = await prisma.user.findUnique({
    where: {
      email: "user@example.com",
    },
  });

  if (!admin || !assignee) {
    throw new Error("Required issue users not found.");
  }

  const issueTrackerProject = await prisma.project.findUnique({
    where: {
      ownerId_name: {
        ownerId: admin.id,
        name: "Issue Tracker",
      },
    },
  });

  const deletedIssueTrackerProject = await prisma.project.findUnique({
    where: {
      ownerId_name: {
        ownerId: admin.id,
        name: "Issue Tracker Deleted",
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

  if (
    !issueTrackerProject ||
    !deletedIssueTrackerProject ||
    !openStatus ||
    !highPriority
  ) {
    throw new Error("Required issue seed data not found.");
  }

  /**
   * 通常Project配下のIssue
   */
  const existingIssue = await prisma.issue.findFirst({
    where: {
      projectId: issueTrackerProject.id,
      reporterId: admin.id,
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
        projectId: issueTrackerProject.id,
        reporterId: admin.id,
        assigneeId: assignee.id,
        statusId: openStatus.id,
        priorityId: highPriority.id,
        dueDate: null,
        deletedAt: null,
      },
    });
  } else {
    await prisma.issue.create({
      data: {
        title: INITIAL_TITLE,
        description: "Cannot login with test account",
        projectId: issueTrackerProject.id,
        reporterId: admin.id,
        assigneeId: assignee.id,
        statusId: openStatus.id,
        priorityId: highPriority.id,
        dueDate: null,
        deletedAt: null,
      },
    });
  }

  /**
   * 削除済みProject配下のIssue
   *
   * Issue自体は未削除とする。
   * 親Projectが削除済みの場合に、子リソースを参照できないことを
   * 確認するための回帰テストデータ。
   */
  const existingDeletedProjectIssue = await prisma.issue.findFirst({
    where: {
      projectId: deletedIssueTrackerProject.id,
      title: DELETED_PROJECT_ISSUE_TITLE,
    },
    orderBy: {
      id: "asc",
    },
  });

  if (existingDeletedProjectIssue) {
    await prisma.issue.update({
      where: {
        id: existingDeletedProjectIssue.id,
      },
      data: {
        title: DELETED_PROJECT_ISSUE_TITLE,
        description: "Issue for deleted parent project regression testing",
        projectId: deletedIssueTrackerProject.id,
        reporterId: admin.id,
        assigneeId: assignee.id,
        statusId: openStatus.id,
        priorityId: highPriority.id,
        dueDate: null,
        deletedAt: null,
      },
    });
  } else {
    await prisma.issue.create({
      data: {
        title: DELETED_PROJECT_ISSUE_TITLE,
        description: "Issue for deleted parent project regression testing",
        projectId: deletedIssueTrackerProject.id,
        reporterId: admin.id,
        assigneeId: assignee.id,
        statusId: openStatus.id,
        priorityId: highPriority.id,
        dueDate: null,
        deletedAt: null,
      },
    });
  }
};
