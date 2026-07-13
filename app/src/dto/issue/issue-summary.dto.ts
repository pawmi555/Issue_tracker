import type { UserSummaryDto } from "../user/user-summary.dto.js";
import type { ProjectReferenceDto } from "../project/project-reference.dto.js";

/**
 * 一覧取得および関連リソース参照で使用する簡易DTO。
 * 必要最小限の項目のみを保持し、詳細情報は保持しない。
 */
export interface IssueSummaryDto {
  id: number;
  title: string;

  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  project?: ProjectReferenceDto | null;
  assignee?: UserSummaryDto | null;
  reporter?: UserSummaryDto | null;
}
