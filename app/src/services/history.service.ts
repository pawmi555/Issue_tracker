import { buildPagination } from "../utils/pagination.js";

import {
  assertProjectHistoryReadable,
  assertIssueHistoryReadable,
  assertCommentHistoryReadable,
} from "./history-access.service.js";

import {
  findUserHistories,
  countUserHistories,
  findProjectHistories,
  countProjectHistories,
  findIssueHistories,
  countIssueHistories,
  getHistoryMasters,
  findCommentHistories,
  countCommentHistories,
} from "../repositories/history.repository.js";

import {
  mapUserHistory,
  mapProjectHistory,
  mapIssueHistory,
  mapCommentHistory,
} from "../mappers/history.mapper.js";

type GetUserHistoriesInput = {
  targetUserId: number;
  query: {
    page: number;
    limit: number;
  };
};

type GetProjectHistoriesInput = {
  projectId: number;
  userId: number;
  query: {
    page: number;
    limit: number;
  };
};

type GetIssueHistoriesInput = {
  issueId: number;
  userId: number;
  query: {
    page: number;
    limit: number;
  };
};

type GetCommentHistoriesInput = {
  commentId: number;
  userId: number;
  query: {
    page: number;
    limit: number;
  };
};

/**
 * User履歴一覧を取得する
 *
 * 履歴データを取得後、
 * 表示用DTOへ変換して返却する。
 */
export const getUserHistoriesService = async ({
  targetUserId,
  query,
}: GetUserHistoriesInput) => {
  const pagination = buildPagination(query);

  const [histories, total] = await Promise.all([
    findUserHistories(targetUserId, pagination),

    countUserHistories(targetUserId),
  ]);

  return {
    data: histories.map((v) => mapUserHistory(v)),

    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  };
};

/**
 * Project履歴一覧を取得する
 *
 * アクセス権限を検証し、
 * 履歴データを取得後、
 * 表示用DTOへ変換して返却する。
 */
export const getProjectHistoriesService = async ({
  projectId,
  userId,
  query,
}: GetProjectHistoriesInput) => {
  await assertProjectHistoryReadable({
    projectId,
    userId,
  });

  const pagination = buildPagination(query);

  const [histories, total] = await Promise.all([
    findProjectHistories(projectId, pagination),

    countProjectHistories(projectId),
  ]);

  return {
    data: histories.map((v) => mapProjectHistory(v)),

    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  };
};

/**
 * Issue履歴一覧を取得する
 *
 * アクセス権限を検証し、
 * 履歴データを取得後、
 * 表示用DTOへ変換して返却する。
 */
export const getIssueHistoriesService = async ({
  issueId,
  userId,
  query,
}: GetIssueHistoriesInput) => {
  await assertIssueHistoryReadable({
    issueId,
    userId,
  });

  const pagination = buildPagination(query);

  const [histories, total, masters] = await Promise.all([
    findIssueHistories(issueId, pagination),

    countIssueHistories(issueId),

    getHistoryMasters(),
  ]);

  return {
    data: histories.map((v) => mapIssueHistory(v, masters)),

    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  };
};

/**
 * Comment履歴一覧を取得する
 *
 * アクセス権限を検証し、
 * 履歴データを取得後、
 * 表示用DTOへ変換して返却する。
 */
export const getCommentHistoriesService = async ({
  commentId,
  userId,
  query,
}: GetCommentHistoriesInput) => {
  await assertCommentHistoryReadable({
    commentId,
    userId,
  });

  const pagination = buildPagination(query);

  const [histories, total] = await Promise.all([
    findCommentHistories(commentId, pagination),

    countCommentHistories(commentId),
  ]);

  return {
    data: histories.map((v) => mapCommentHistory(v)),

    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  };
};
