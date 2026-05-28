import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { parseInclude } from "../utils/include-parser.js";
import {
  buildIssueInclude,
  validateIssueIncludes,
  isIssueIncludeField,
} from "../utils/issue-include.js";

import { checkProjectRole } from "../utils/role-check.js";

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

type UpdateIssueInput = {
  issueId: number;

  userId: number;

  data: {
    title?: string;
    description?: string | null;
    statusId?: number;
    priorityId?: number;
    assigneeId?: number | null;
    dueDate?: Date | null;
  };
};

type GetIssueDetailInput = {
  issueId: number;

  userId: number;

  include?: string;

  includeDeleted?: boolean;
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

/**
 * Issue更新
 */
export const updateIssueService = async ({
  issueId,
  userId,
  data,
}: UpdateIssueInput) => {
  // Issue取得
  // deletedAt確認
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
    },

    include: {
      project: true,
      status: true,
    },
  });

  if (!issue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }

  // CLOSED確認
  if (issue.status.name === "CLOSED") {
    throw new AppError("issue closed", 403, "ISSUE_CLOSED");
  }
  // project削除確認
  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // ProjectMember取得
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: issue.projectId,
        userId,
      },
    },

    include: {
      role: true,
    },
  });

  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }
  // OWNER/MANAGER/assignee認可
  const isAssignee = issue.assigneeId === userId;

  const roleName = member.role.name;

  const canUpdate =
    isAssignee ||
    checkProjectRole({
      memberRole: member.role.name,

      allowedRoles: ["OWNER", "MANAGER"],
    });

  if (!canUpdate) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }
  // FK存在確認
  if (data.statusId !== undefined) {
    const status = await prisma.issueStatus.findUnique({
      where: {
        id: data.statusId,
      },
    });

    if (!status) {
      throw new AppError("invalid status", 400, "INVALID_STATUS");
    }
  }

  if (data.priorityId !== undefined) {
    const priority = await prisma.issuePriority.findUnique({
      where: {
        id: data.priorityId,
      },
    });

    if (!priority) {
      throw new AppError("invalid priority", 404, "INVALID_PRIORITY");
    }
  }

  if (data.assigneeId !== undefined && data.assigneeId !== null) {
    const assignee = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: issue.projectId,
          userId: data.assigneeId,
        },
      },
    });

    if (!assignee) {
      throw new AppError("ASSIGNEE_NOT_PROJECT_MEMBER");
    }
  }
  // 差分抽出
  const trackedFields = [
    "title",
    "description",
    "statusId",
    "priorityId",
    "assigneeId",
    "dueDate",
  ] as const;

  const histories: {
    fieldName: string;
    oldValue: unknown;
    newValue: unknown;
  }[] = [];

  for (const field of trackedFields) {
    if (!(field in data)) {
      continue;
    }

    const oldValue = issue[field];
    const newValue = data[field];

    const isChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

    if (!isChanged) {
      continue;
    }

    histories.push({
      fieldName: field,
      oldValue,
      newValue,
    });
  }
  // 差分なし
  if (histories.length === 0) {
    return issue;
  }
  // transaction開始
  return prisma.$transaction(async (tx) => {
    // issue更新
    const updatedIssue = await tx.issue.update({
      where: {
        id: issueId,
      },

      data: {
        ...data,
      },

      include: {
        status: true,
        priority: true,
        assignee: true,
        reporter: true,
      },
    });
    // issueHistory作成
    await tx.issueHistory.createMany({
      data: histories.map((history) => ({
        issueId,
        userId,

        fieldName: history.fieldName,

        oldValue: history.oldValue,

        newValue: history.newValue,
      })),
    });

    return updatedIssue;
  });
};

/**
 * Issue詳細取得
 */
export const getIssueDetailService = async ({
  issueId,
  userId,
  include,
  includeDeleted,
}: GetIssueDetailInput) => {
  // soft delete
  const where: Prisma.IssueWhereInput = {
    id: issueId,
  };
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  // Issue取得
  const issue = await prisma.issue.findFirst({
    where,

    include: {
      project: true,
    },
  });
  if (!issue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }
  // project削除確認
  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }
  // 認可
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: issue.projectId,
        userId,
      },
    },
  });
  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }
  // include構築
  const includes = parseInclude(include as string);

  validateIssueIncludes(includes);

  const safeIncludes = includes.filter(isIssueIncludeField);

  const prismaInclude = buildIssueInclude(safeIncludes);

  // 本取得
  const detailedIssue = await prisma.issue.findFirst({
    where,

    include: {
      ...prismaInclude,
      status: true,
      priority: true,
    },
  });
  if (!detailedIssue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }
  return detailedIssue;
};
