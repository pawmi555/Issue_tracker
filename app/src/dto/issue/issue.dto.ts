import type { IssueSummaryDto } from "./issue-summary.dto.js";
import type { StatusDto } from "../common/status.dto.js";
import type { PriorityDto } from "../common/priority.dto.js";
import type { CommentDto } from "../comment/comment.dto.js";

/**
 * 詳細取得・作成・更新・復元APIで使用するDTO。リソースの詳細情報を保持する。
 */
export interface IssueDto extends IssueSummaryDto {
  description: string | null;

  status: StatusDto;
  priority: PriorityDto;

  comments?: CommentDto[];
}
