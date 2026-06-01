type PaginationInput = {
  page?: number;
  limit?: number;
};

type PaginationResult = {
  skip: number;
  take: number;
  page: number;
  limit: number;
};

/**
 * ページネーション情報を生成する
 *
 * pageとlimitを正規化し、
 * Prismaで利用するskipとtakeを算出する。
 */
export const buildPagination = ({
  page = 1,
  limit = 20,
}: PaginationInput): PaginationResult => {
  const safePage = Math.max(page, 1);

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit,
  };
};
