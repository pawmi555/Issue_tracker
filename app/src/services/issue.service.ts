import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { parseInclude } from "../utils/include-parser.js";
import { buildIssueInclude } from "../utils/issue-include.js";

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

type GetIssuesInput = {
  projectId: number;

  userId: number;

  query: {
    page?: number;
    limit?: number;

    statusId?: number;
    priorityId?: number;
    assigneeId?: number;

    keyword?: string;

    sort?: "createdAt" | "dueDate";

    order?: "asc" | "desc";

    include?: string;
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

/**
 * Issue一覧取得
 */

export const getIssuesService = async ({
  projectId,
  userId,
  query,
}: GetIssuesInput) => {
  // member check
  const member = await prisma.projectMember.findUnique({
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

  if (member.project.deletedAt) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  // pagination
  const page = query.page ?? 1;

  const limit = query.limit ?? 20;

  const skip = (page - 1) * limit;

  // where build
  const where: Prisma.IssueWhereInput = {
    projectId,

    deletedAt: null,
  };

  if (query.statusId) {
    where.statusId = query.statusId;
  }

  if (query.priorityId) {
    where.priorityId = query.priorityId;
  }

  if (query.assigneeId) {
    where.assigneeId = query.assigneeId;
  }

  if (query.keyword) {
    where.OR = [
      {
        title: {
          contains: query.keyword,
          mode: "insensitive",
        },
      },

      {
        description: {
          contains: query.keyword,
          mode: "insensitive",
        },
      },
    ];
  }

  // include build
  const includes = parseInclude(query.include);

  if (includes.length > 3) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  const prismaInclude = buildIssueInclude(includes);

  // order build
  const orderBy = {
    [query.sort ?? "createdAt"]: query.order ?? "desc",
  };

  // prisma query
  const [issues, total] = await prisma.$transaction([
    prisma.issue.findMany({
      where,

      include: prismaInclude,

      orderBy,

      skip,

      take: limit,
    }),

    prisma.issue.count({
      where,
    }),
  ]);

  // return
  return {
    data: issues,

    meta: {
      page,
      limit,
      total,
    },
  };
};
