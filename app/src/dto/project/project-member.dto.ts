import { RoleDto } from "../common/role.dto.js";
import { UserSummaryDto } from "../user/user-summary.dto.js";

/**
 * プロジェクトメンバー情報
 */
export interface ProjectMemberDto {
  id: number;
  role: RoleDto;
  user: UserSummaryDto;

  createdAt: Date;
  updatedAt: Date;
}
