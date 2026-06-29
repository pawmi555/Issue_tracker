import { buildPagination } from "../utils/pagination.js";

import { assertIssueHistoryReadable } from "./history-access.service.js";

import {
  findIssueHistories,
  countIssueHistories,
  getHistoryMasters,
} from "../repositories/history.repository.js";

import { mapIssueHistory } from "../mappers/history.mapper.js";

type GetIssueHistoriesInput = {
  issueId: number;
  userId: number;
  query: {
    page: number;
    limit: number;
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
