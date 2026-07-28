import type { PaginationMetaDto } from "../dto/common/pagination-meta.dto.js";

export const buildPaginationMeta = ({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}): PaginationMetaDto => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
