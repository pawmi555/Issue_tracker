import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { parseInclude } from "../utils/include-parser.js";
import {
  isIssueIncludeField,
  validateIssueIncludes,
} from "../validators/issue-include.validator.js";
import { buildIssueInclude } from "./builders/build-issue-include.js";
import { buildPagination } from "../utils/pagination.js";
import { requireRole } from "../middlewares/requireRoleMiddleware.js";
import { buildIssueHistories } from "../utils/history.utils.js";
import { mapIssueResponse, toIssueDto } from "../mappers/issue.mapper.js";
import { GetIssuesInput } from "../types/issue.types.js";
import { buildIssueWhere } from "./builders/build-issue-where.js";
import { hasProjectRole, isProjectRoleName } from "../utils/role-check.js";

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
    !hasProjectRole({
      memberRole: roleName,
      minimumRole: "MEMBER",
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
  const where = buildIssueWhere({
    projectId,
    query,
  });

  // Include検証・生成
  const prismaInclude = buildIssueInclude(query.include ?? []);

  // ソート条件生成
  const orderBy = {
    [query.sort ?? "createdAt"]: query.order ?? "desc",
  };

  const [issues, total] = await prisma.$transaction([
    prisma.issue.findMany({
      where,
      ...(Object.keys(prismaInclude).length > 0 && {
        include: prismaInclude,
      }),
      orderBy,
      skip,
      take,
    }),

    prisma.issue.count({
      where,
    }),
  ]);

  return {
    data: issues.map(toIssueDto),
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
  // FK存在確認
  const [status, priority] = await Promise.all([
    data.statusId !== undefined
      ? prisma.issueStatus.findUnique({
          where: {
            id: data.statusId,
          },
        })
      : null,

    data.priorityId !== undefined
      ? prisma.issuePriority.findUnique({
          where: {
            id: data.priorityId,
          },
        })
      : null,
  ]);

  if (data.statusId !== undefined && !status) {
    throw new AppError("invalid status", 404, "INVALID_STATUS");
  }

  if (data.priorityId !== undefined && !priority) {
    throw new AppError("invalid priority", 404, "INVALID_PRIORITY");
  }

  // レスポンス定義
  const issueResponseSelect = {
    id: true,
    title: true,
    description: true,
    dueDate: true,
    updatedAt: true,

    status: {
      select: {
        id: true,
        name: true,
        label: true,
      },
    },

    priority: {
      select: {
        id: true,
        name: true,
        label: true,
      },
    },

    assignee: {
      select: {
        id: true,
        name: true,
      },
    },
  } satisfies Prisma.IssueSelect;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const HISTORY_ACTION_UPDATE = 1;
    // Issue存在確認
    const issue = await tx.issue.findFirst({
      where: {
        id: issueId,
        deletedAt: null,
      },

      select: {
        id: true,
        projectId: true,
        assigneeId: true,

        title: true,
        description: true,
        dueDate: true,

        statusId: true,
        priorityId: true,

        project: true,
        status: true,
      },
    });

    if (!issue) {
      throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
    }

    // CLOSEDのIssueは更新不可
    if (issue.status.name === "CLOSED") {
      throw new AppError("issue closed", 403, "ISSUE_CLOSED");
    }

    // 削除済みProjectは更新不可
    if (issue.project.deletedAt) {
      throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
    }

    // Project参加確認
    const member = await tx.projectMember.findUnique({
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

    const hasManagerRole = checkProjectRole({
      memberRole: member.role.name,
      allowedRoles: ["OWNER", "MANAGER"],
    });

    const canUpdate = isAssignee || hasManagerRole;

    if (!canUpdate) {
      throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
    }

    // Assignee所属確認
    if (data.assigneeId !== undefined && data.assigneeId !== null) {
      const assignee = await tx.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: issue.projectId,
            userId: data.assigneeId,
          },
        },
      });

      if (!assignee) {
        throw new AppError(
          "assignee not project member",
          400,
          "ASSIGNEE_NOT_PROJECT_MEMBER",
        );
      }
    }

    // 履歴生成（メモリ）
    const histories = buildIssueHistories({
      before: {
        title: issue.title,
        description: issue.description,
        statusId: issue.statusId,
        priorityId: issue.priorityId,
        assigneeId: issue.assigneeId,
        dueDate: issue.dueDate,
      },

      after: data,
      issueId,
      userId,
      actionId: HISTORY_ACTION_UPDATE,
    });

    // 差分なし
    if (histories.length === 0) {
      const current = await tx.issue.findUniqueOrThrow({
        where: {
          id: issueId,
        },
        select: issueResponseSelect,
      });

      return mapIssueResponse(current);
    }

    const updatedIssue = await tx.issue.update({
      where: {
        id: issueId,
      },
      data,
      select: issueResponseSelect,
    });

    await tx.issueHistory.createMany({
      data: histories,
    });

    return mapIssueResponse(updatedIssue);
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
  // 動的検索条件生成
  const where: Prisma.IssueWhereInput = {
    id: issueId,
  };
  // includeDeleted=falseの場合は削除済みIssueを除外
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  // Issue存在確認
  const issue = await prisma.issue.findFirst({
    where,
    include: {
      project: {
        select: {
          deletedAt: true,
        },
      },
    },
  });

  if (!issue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }

  // 削除済みProjectは参照不可
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
  });

  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  // Include検証・生成
  const includes = parseInclude(include);

  validateIssueIncludes(includes, true);

  const safeIncludes = includes.filter(isIssueIncludeField);
  const prismaInclude = buildIssueInclude(safeIncludes);

  // Issue詳細取得
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
  // Issue削除可否確認用データ取得
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
    },

    include: {
      project: {
        select: {
          deletedAt: true,
        },
      },

      status: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!issue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }

  // 削除済みProjectは操作不可
  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // CLOSED済みIssueは操作不可
  if (issue.status.name === "CLOSED") {
    throw new AppError("issue closed", 403, "ISSUE_CLOSED");
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
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  // Issue削除権限確認
  const canDelete = requireRole("MANAGER");

  if (!canDelete) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const now = new Date();

    // Issueソフトデリート実行
    const deletedIssue = await tx.issue.updateMany({
      where: {
        id: issueId,
        deletedAt: null,
      },

      data: {
        deletedAt: now,
      },
    });

    if (deletedIssue.count === 0) {
      throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
    }

    // 削除履歴記録
    // await tx.issueHistory.create({
    //   data: {
    //     issueId,
    //     userId,
    //     fieldName: ISSUE_HISTORY_FIELDS.DELETED,
    //     oldValue: false,
    //     newValue: true,
    //     createdAt: now,
    //   },
    // });
    return;
  });
};

/**
 * Issue復元
 */
export const restoreIssueService = async ({
  issueId,
  userId,
}: RestoreIssueInput) => {
  // Issue存在確認
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
    include: {
      project: true,
      status: true,
    },
  });

  if (!issue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }

  // 削除済みIssueのみ復元可能
  if (!issue.deletedAt) {
    throw new AppError("issue already restored", 409, "ISSUE_ALREADY_RESTORED");
  }

  // 削除済みProjectは操作不可
  if (issue.project.deletedAt) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  // CLOSED済みIssueは操作不可
  if (issue.status.name === "CLOSED") {
    throw new AppError("issue closed", 403, "ISSUE_CLOSED");
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

  // Issue復元権限確認
  const canRestore = requireRole("MANAGER");

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

    // 復元履歴記録
    // await tx.issueHistory.create({
    //   data: {
    //     issueId,
    //     userId,
    //     fieldName: ISSUE_HISTORY_FIELDS.DELETED,
    //     oldValue: true,
    //     newValue: false,
    //   },
    // });
    return restoredIssue;
  });
};
