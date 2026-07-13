import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/app-error.js";
import { buildPagination } from "../utils/pagination.js";
import { buildPaginationMeta } from "../utils/pagination-meta.js";
import { buildIssueHistories } from "../utils/history.utils.js";
import { mapIssue } from "../mappers/issue/issue.mapper.js";
import { mapIssueSummary } from "../mappers/issue/issue-summary.mapper.js";
import { mapIssueSummaryWithRelation } from "../mappers/issue/issue-summary-with-relation.mapper.js";
import {
  issueDtoSelect,
  issueSummarySelect,
  issueHistorySelect,
  buildIssueRelationSelect,
} from "../selects/issue.select.js";

import type {
  CreateIssueInput,
  GetIssuesInput,
  UpdateIssueInput,
  GetIssueDetailInput,
  DeleteIssueInput,
  RestoreIssueInput,
} from "../types/issue.types.js";

import type { IssueMapperInput } from "../mappers/issue/issue-mapper.type.js";

import { buildIssueWhere } from "./builders/build-issue-where.js";
import { buildIssueDetailWhere } from "./builders/build-issue-detail-where.js";
import { isProjectRoleName, assertProjectRole } from "../utils/role-check.js";

import {
  validateIssueTransition,
  isIssueStatusId,
} from "../validators/issue.validation.js";

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
    if (data.assigneeId !== undefined) {
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

    const OPEN_STATUS_ID = 1;

    const issue = await tx.issue.create({
      data: {
        projectId,
        reporterId: userId,
        title: data.title,
        description: data.description,
        priorityId: data.priorityId,
        statusId: OPEN_STATUS_ID,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
      },

      select: issueDtoSelect,
    });

    return mapIssue(issue);
  });
};

/**
 * Issue一覧取得
 */
export const getIssuesService = async ({
  projectId,
  userId,
  query,
  includeDeleted = false,
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

  assertProjectRole({
    memberRole: roleName,
    minimumRole: includeDeleted ? "MANAGER" : "MEMBER",
  });

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
  const where = buildIssueWhere(
    {
      projectId,
      query,
    },
    includeDeleted,
  );

  // ソート条件生成
  const orderBy: Prisma.IssueOrderByWithRelationInput = {
    [query.sort ?? "createdAt"]: query.order ?? "desc",
  };

  const relationSelect = query.include
    ? buildIssueRelationSelect(query.include, false)
    : null;

  const hasRelation = relationSelect && Object.keys(relationSelect).length > 0;

  const [issues, total] = await prisma.$transaction([
    prisma.issue.findMany({
      where,
      orderBy,
      skip,
      take,

      select: {
        ...issueSummarySelect,
        ...(relationSelect ?? {}),
      },
    }),

    prisma.issue.count({
      where,
    }),
  ]);

  return {
    data: hasRelation
      ? issues.map((issue) =>
          mapIssueSummaryWithRelation(issue, {
            includeDeleted,
          }),
        )
      : issues.map((issue) =>
          mapIssueSummary(issue, {
            includeDeleted,
          }),
        ),
    meta: buildPaginationMeta({
      page,
      limit,
      total,
    }),
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

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const HISTORY_ACTION_UPDATE = 1;
    // Issue存在確認
    const issue = await tx.issue.findFirst({
      where: {
        id: issueId,
        deletedAt: null,
      },

      select: issueHistorySelect,
    });

    if (!issue) {
      throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
    }

    // CLOSEDのIssueは更新不可
    if (issue.status.name === "CLOSED") {
      throw new AppError("issue closed", 403, "ISSUE_CLOSED");
    }

    // 状態遷移制御
    if (data.statusId !== undefined) {
      if (!isIssueStatusId(issue.statusId) || !isIssueStatusId(data.statusId)) {
        throw new AppError("invalid status", 400, "INVALID_STATUS");
      }

      validateIssueTransition(issue.statusId, data.statusId);
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
    const roleName = member.role.name;

    if (!isProjectRoleName(roleName)) {
      throw new AppError("invalid role", 500, "INVALID_ROLE");
    }

    const isAssignee = issue.assigneeId === userId;

    if (!isAssignee) {
      assertProjectRole({
        memberRole: roleName,
        minimumRole: "MANAGER",
      });
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
        select: issueDtoSelect,
      });

      return mapIssue(current);
    }

    const updatedIssue = await tx.issue.update({
      where: {
        id: issueId,
      },
      data,
      select: issueDtoSelect,
    });

    await tx.issueHistory.createMany({
      data: histories,
    });

    return mapIssue(updatedIssue);
  });
};

/**
 * Issue詳細取得
 */
export const getIssueDetailService = async ({
  issueId,
  userId,
  query,
  includeDeleted = false,
}: GetIssueDetailInput) => {
  // 動的検索条件生成
  const where = buildIssueDetailWhere({
    issueId,
    includeDeleted,
  });

  // Include検証・生成
  const prismaInclude = query.include
    ? buildIssueRelationSelect(query.include, true)
    : undefined;

  // Issue詳細取得
  const issue = await prisma.issue.findFirst({
    where,
    select: {
      ...issueDtoSelect,
      projectId: true,
      ...(prismaInclude ?? {}),
    },
  });

  console.dir(issue, {
    depth: null,
  });

  if (!issue) {
    throw new AppError("issue not found", 404, "ISSUE_NOT_FOUND");
  }

  // 削除済みProjectは参照不可
  const project = await prisma.project.findUnique({
    where: {
      id: issue.projectId,
    },
    select: {
      deletedAt: true,
    },
  });

  if (!project || project.deletedAt) {
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

  // Issue閲覧権限確認
  const roleName = member.role.name;

  if (!isProjectRoleName(roleName)) {
    throw new AppError("invalid role", 500, "INVALID_ROLE");
  }

  assertProjectRole({
    memberRole: roleName,
    minimumRole: includeDeleted ? "MANAGER" : "MEMBER",
  });
  //Prismaは動的selectの戻り値を正確に推論できないためキャストする
  return mapIssue(issue as unknown as IssueMapperInput, {
    includeDeleted,
  });
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
  const roleName = member.role.name;

  if (!isProjectRoleName(roleName)) {
    throw new AppError("invalid role", 500, "INVALID_ROLE");
  }

  assertProjectRole({
    memberRole: roleName,
    minimumRole: "MANAGER",
  });

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
  const roleName = member.role.name;

  if (!isProjectRoleName(roleName)) {
    throw new AppError("invalid role", 500, "INVALID_ROLE");
  }

  assertProjectRole({
    memberRole: roleName,
    minimumRole: "MANAGER",
  });

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // restore実行
    const restoredIssue = await tx.issue.updateMany({
      where: {
        id: issueId,
        NOT: {
          deletedAt: null,
        },
      },

      data: {
        deletedAt: null,
      },
    });

    if (restoredIssue.count === 0) {
      throw new AppError(
        "issue already restored",
        409,
        "ISSUE_ALREADY_RESTORED",
      );
    }

    return;
  });
};
