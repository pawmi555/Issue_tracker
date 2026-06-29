import { prisma } from "../lib/prisma.js";

import type {
  UserHistoryRecord,
  ProjectHistoryRecord,
  IssueHistoryRecord,
  CommentHistoryRecord,
  MasterMap,
} from "../mappers/history.mapper.js";

type MasterRecord = {
  id: number;
  name: string;
};

/**
 * User履歴一覧を取得する
 *
 * createdAt降順でページング取得する。
 */
export const findUserHistories = async (
  userId: number,
  pagination: {
    skip: number;
    take: number;
  },
): Promise<UserHistoryRecord[]> => {
  return prisma.userHistory.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    skip: pagination.skip,

    take: pagination.take,

    include: {
      action: {
        select: {
          name: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * User履歴件数を取得する
 */
export const countUserHistories = (userId: number): Promise<number> => {
  return prisma.userHistory.count({
    where: {
      userId,
    },
  });
};

/**
 * Project履歴一覧を取得する
 *
 * createdAt降順でページング取得する。
 */
export const findProjectHistories = async (
  projectId: number,
  pagination: {
    skip: number;
    take: number;
  },
): Promise<ProjectHistoryRecord[]> => {
  return prisma.projectHistory.findMany({
    where: {
      projectId,
    },

    orderBy: {
      createdAt: "desc",
    },

    skip: pagination.skip,

    take: pagination.take,

    include: {
      action: {
        select: {
          name: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Project履歴件数を取得する
 */
export const countProjectHistories = (projectId: number): Promise<number> => {
  return prisma.projectHistory.count({
    where: {
      projectId,
    },
  });
};

/**
 * Issue履歴一覧を取得する
 *
 * createdAt降順でページング取得する。
 */
export const findIssueHistories = async (
  issueId: number,
  pagination: {
    skip: number;
    take: number;
  },
): Promise<IssueHistoryRecord[]> => {
  return prisma.issueHistory.findMany({
    where: {
      issueId,
    },

    orderBy: {
      createdAt: "desc",
    },

    skip: pagination.skip,

    take: pagination.take,

    include: {
      action: {
        select: {
          name: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Issue履歴件数を取得する
 */
export const countIssueHistories = (issueId: number): Promise<number> => {
  return prisma.issueHistory.count({
    where: {
      issueId,
    },
  });
};

/**
 * IssueStatus表示変換用マスタを取得する
 */
const findIssueStatuses = async (): Promise<MasterRecord[]> => {
  return prisma.issueStatus.findMany({
    select: {
      id: true,
      name: true,
    },
  });
};

/**
 * IssuePriority表示変換用マスタを取得する
 */
const findIssuePriorities = async (): Promise<MasterRecord[]> => {
  return prisma.issuePriority.findMany({
    select: {
      id: true,
      name: true,
    },
  });
};

/**
 * 履歴表示変換用マスタを取得する
 *
 * 履歴に保持された内部値をAPI返却用表示値へ変換するための
 * マスタ辞書を生成して返却する。
 */
export const getHistoryMasters = async (): Promise<MasterMap> => {
  const [statuses, priorities] = await Promise.all([
    findIssueStatuses(),
    findIssuePriorities(),
  ]);

  return {
    status: Object.fromEntries(statuses.map((v) => [v.id, v.name])),

    priority: Object.fromEntries(priorities.map((v) => [v.id, v.name])),
  };
};

/**
 * Comment履歴一覧を取得する
 *
 * createdAt降順でページング取得する。
 */
export const findCommentHistories = async (
  commentId: number,
  pagination: {
    skip: number;
    take: number;
  },
): Promise<CommentHistoryRecord[]> => {
  return prisma.commentHistory.findMany({
    where: {
      commentId,
    },

    orderBy: {
      createdAt: "desc",
    },

    skip: pagination.skip,

    take: pagination.take,

    include: {
      action: {
        select: {
          name: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Comment履歴件数を取得する
 */
export const countCommentHistories = (commentId: number): Promise<number> => {
  return prisma.commentHistory.count({
    where: {
      commentId,
    },
  });
};
