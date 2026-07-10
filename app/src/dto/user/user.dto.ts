import { RoleDto } from "../common/role.dto.js";

/**
 * 詳細取得・作成・更新APIで使用するDTO。リソースの詳細情報を保持する。
 */
export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: RoleDto;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
