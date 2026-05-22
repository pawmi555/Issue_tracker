import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

type CreateIssueInput = {
  projectId: number;
  userId: number;

  data: {
    title: string;
    description?: string;
    priorityId: number;
    statusId: number;
    assigneeId?: number;
    dueDate?: Date;
  };
};

/**
 * Issue作成
 */
export const createIssueService = async ({
  projectId,
  userId,
  data,
}: CreateIssueInput) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // project member check
    const member = await tx.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        role: true,
        project: true,
      },
    });

    if (!member) {
      throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
    }

    // project deleted check
    if (member.project.deletedAt) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    // assignee member check
    if (data.assigneeId) {
      const assigneeMember = await tx.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: data.assigneeId,
          },
        },
      });

      if (!assigneeMember) {
        throw new AppError(
          "assignee not project member",
          403,
          "ASSIGNEE_NOT_PROJECT_MEMBER",
        );
      }
    }

    // priority exists
    const priority = await tx.issuePriority.findUnique({
      where: {
        id: data.priorityId,
      },
    });

    if (!priority) {
      throw new AppError("invalid priority", 404, "INVALID_PRIORITY");
    }

    // status exists
    const status = await tx.issueStatus.findUnique({
      where: {
        id: data.statusId,
      },
    });

    if (!status) {
      throw new AppError("invalid status", 404, "INVALID_STATUS");
    }

    const issue = await tx.issue.create({
      data: {
        projectId,

        reporterId: userId,

        title: data.title,
        description: data.description,

        priorityId: data.priorityId,
        statusId: data.statusId,

        assigneeId: data.assigneeId,

        dueDate: data.dueDate,
      },

      include: {
        assignee: true,
        reporter: true,
        priority: true,
        status: true,
      },
    });

    return issue;
  });
};
