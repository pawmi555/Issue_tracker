import { ProjectSummaryDto } from "./project-summary.dto.js";
import { ProjectMemberDto } from "./project-member.dto.js";

/**
 * 詳細取得・作成・更新APIで使用するDTO。リソースの詳細情報を保持する。
 */
export interface ProjectDto extends ProjectSummaryDto {
  ownerId: number;
  members: ProjectMemberDto[];
}
