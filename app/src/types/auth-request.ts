import type { Request } from "express";

import type { ProjectRoleName } from "../constants/project.constants.js";

export interface JwtUser {
  id: number;
}

export interface ProjectMemberPayload {
  id: number;

  role: {
    name: ProjectRoleName;
  };

  project: {
    id: number;
    deletedAt: Date | null;
  };
}

/**
 * JWT認証後のユーザー情報を保持するRequest型
 *
 * 認証ミドルウェアで req.user, req.projectMember が設定される
 */
export interface AuthRequest extends Request {
  user?: JwtUser;
  projectMember?: ProjectMemberPayload;
}
