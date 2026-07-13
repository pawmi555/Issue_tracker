import type { UserSummaryDto } from "../user/user-summary.dto.js";
import type { CountDto } from "../common/count.dto.js";

/**
 * 一覧取得および関連リソース参照で使用する簡易DTO。
 * 必要最小限の項目のみを保持し、詳細情報は保持しない。
 */
export interface ProjectSummaryDto {
  id: number;
  name: string;
  description: string | null;

  owner: UserSummaryDto;

  counts: CountDto;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
