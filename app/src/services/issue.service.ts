import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { parseInclude } from "../utils/include-parser.js";
import {
  IssueIncludeField,
  buildIssueInclude,
  validateIssueIncludes,
  isIssueIncludeField,
  ISSUE_INCLUDE_FIELDS,
} from "../utils/issue-include.js";

import {
  checkProjectRole,
  isProjectRoleName,
  ISSUE_READ_ROLES,
} from "../utils/role-check.js";

import { buildPagination } from "../utils/pagination.js";

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

type DeleteIssueInput = {
  issueId: number;
  userId: number;
};

type RestoreIssueInput = {
  issueId: number;
  userId: number;
};

export const ISSUE_HISTORY_FIELDS = {
  DELETED: "deleted",
} as const;

/**
 * Issue作成
 */
export const createIssueService = async ({
  projectId,
  userId,
  data,
}: CreateIssueInput) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Project参加確認
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

    // 削除済みProjectは操作不可
    if (member.project.deletedAt) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    // Assignee所属確認
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

    // Priority存在確認
    const priority = await tx.issuePriority.findUnique({
      where: {
        id: data.priorityId,
      },
    });

    if (!priority) {
      throw new AppError("invalid priority", 404, "INVALID_PRIORITY");
    }

    // Status存在確認
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
  // Project参加確認
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

  // Issue閲覧権限確認
  const roleName = member.role.name;

  if (!isProjectRoleName(roleName)) {
    throw new AppError("invalid role", 500, "INVALID_ROLE");
  }

  if (
    !checkProjectRole({
      memberRole: roleName,
      allowedRoles: ISSUE_READ_ROLES,
    })
  ) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  // 削除済みProjectは参照不可
  if (member.project.deletedAt) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  // ページネーション設定
  const { page, limit, skip, take } = buildPagination({
    page: query.page,
    limit: query.limit,
  });

  // 動的検索条件生成
  const where: Prisma.IssueWhereInput = {
    projectId,
    deletedAt: null,
  };

  if (query.statusId !== undefined) {
    where.statusId = query.statusId;
  }

  if (query.priorityId !== undefined) {
    where.priorityId = query.priorityId;
  }

  if (query.assigneeId !== undefined) {
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

  // Include検証・生成
  const includes = parseInclude(query.include);

  if (includes.length > 3) {
    throw new AppError("include limit exceeded", 400, "INCLUDE_LIMIT_EXCEEDED");
  }

  const invalidIncludes = includes.filter(
    (include) => !ISSUE_INCLUDE_FIELDS.includes(include as IssueIncludeField),
  );

  if (invalidIncludes.length > 0) {
    throw new AppError("invalid include", 400, "INVALID_INCLUDE");
  }

  const validIncludes = includes as IssueIncludeField[];

  const prismaInclude = buildIssueInclude(validIncludes);

  // ソート条件生成
  const orderBy = {
    [query.sort ?? "createdAt"]: query.order ?? "desc",
  };

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
  // Issue存在確認
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

  // CLOSEDのProjectは更新不可
  if (issue.status.name === "CLOSED") {
    throw new AppError("issue closed", 403, "ISSUE_CLOSED");
  }

  // 削除済みProjectは更新不可
  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // Project参加確認
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

  // Issue更新権限確認
  const isAssignee = issue.assigneeId === userId;
  const roleName = member.role.name;

  if (
    !isAssignee ||
    checkProjectRole({
      memberRole: roleName,
      allowedRoles: ["OWNER", "MANAGER"],
    })
  ) {
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

  // Priority存在確認
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

  // Assignee所属確認
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

  // 差分なしの場合はissue返却
  if (histories.length === 0) {
    return issue;
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

/**
 * Issue削除
 */
export const deleteIssueService = async ({
  issueId,
  userId,
}: DeleteIssueInput) => {
  // Issue取得
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

  // project削除確認
  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // CLOSED確認
  if (issue.status.name === "CLOSED") {
    throw new AppError("issue closed", 403, "ISSUE_CLOSED");
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

  // 認可
  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  const canDelete = checkProjectRole({
    memberRole: member.role.name,

    allowedRoles: ["OWNER", "MANAGER"],
  });

  if (!canDelete) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  return prisma.$transaction(async (tx) => {
    const now = new Date();
    // soft delete
    const deletedIssue = await tx.issue.updateMany({
      where: {
        id: issueId,
        deletedAt: null,
      },

      data: {
        deletedAt: now,
      },
    });

    // IssueHistory作成
    await tx.issueHistory.create({
      data: {
        issueId,
        userId,

        fieldName: ISSUE_HISTORY_FIELDS.DELETED,

        oldValue: false,

        newValue: true,

        createdAt: now,
      },
    });
    return deletedIssue;
  });
};

/**
 * Issue復元
 */
export const restoreIssueService = async ({
  issueId,
  userId,
}: RestoreIssueInput) => {
  // 対象Issue取得
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
    include: {
      project: true,
      status: true,
    },
  });

  // Issue存在確認
  if (!issue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }

  // 削除済みIssueのみ復元可能
  if (!issue.deletedAt) {
    throw new AppError("issue already restored", 409, "ISSUE_ALREADY_RESTORED");
  }

  // project削除確認
  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // CLOSED確認
  if (issue.status.name === "CLOSED") {
    throw new AppError("issue closed", 403, "ISSUE_CLOSED");
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

  // 認可
  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  const canRestore = checkProjectRole({
    memberRole: member.role.name,

    allowedRoles: ["OWNER", "MANAGER"],
  });

  if (!canRestore) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // restore実行
    const restoredIssue = await tx.issue.update({
      where: {
        id: issueId,
      },

      data: {
        deletedAt: null,
      },
    });

    // IssueHistory作成
    await tx.issueHistory.create({
      data: {
        issueId,
        userId,
        fieldName: "deleted",
        oldValue: true,
        newValue: false,
      },
    });
    return restoredIssue;
  });
};
