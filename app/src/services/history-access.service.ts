import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/app-error.js";

type AssertProjectHistoryReadableInput = {
  projectId: number;
  userId: number;
};

type AssertIssueHistoryReadableInput = {
  issueId: number;
  userId: number;
};

type AssertCommentHistoryReadableInput = {
  commentId: number;
  userId: number;
};

/**
 * 指定ユーザーがProject履歴を参照可能か検証する
 *
 * Projectの存在確認、
 * 論理削除状態確認、
 * およびプロジェクト所属確認を行う。
 *
 * 条件を満たさない場合は例外を送出する。
 */
export const assertProjectHistoryReadable = async ({
  projectId,
  userId,
}: AssertProjectHistoryReadableInput) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },

    select: {
      id: true,
    },
  });

  if (!project) {
    throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }
};

/**
 * 指定ユーザーがIssue履歴を参照可能か検証する
 *
 * Issueの存在確認、
 * 論理削除状態確認、
 * およびプロジェクト所属確認を行う。
 *
 * 条件を満たさない場合は例外を送出する。
 */
export const assertIssueHistoryReadable = async ({
  issueId,
  userId,
}: AssertIssueHistoryReadableInput) => {
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
    },

    select: {
      projectId: true,
    },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404, "ISSUE_NOT_FOUND");
  }

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
};

/**
 * 指定ユーザーがComment履歴参照可能か検証する
 *
 * Comment存在確認、
 * 論理削除状態確認、
 * およびプロジェクト所属確認を行う。
 *
 * 条件を満たさない場合は例外を送出する。
 */
export const assertCommentHistoryReadable = async ({
  commentId,
  userId,
}: AssertCommentHistoryReadableInput) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
    },

    select: {
      issue: {
        select: {
          projectId: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: comment.issue.projectId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
  }
};
