import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/app-error.js";

type AssertIssueHistoryReadableInput = {
  issueId: number;
  userId: number;
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
