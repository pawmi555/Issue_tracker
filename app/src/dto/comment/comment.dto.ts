import type { UserSummaryDto } from "../user/user-summary.dto.js";

/**
 * コメント情報
 */
export interface CommentDto {
  id: number;
  content: string;
  user: UserSummaryDto;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
