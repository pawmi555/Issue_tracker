import { Request } from "express";

import { ProjectRoleName } from "../constants/project.constants.js";

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
 * 認証ミドルウェアで req.user が設定される
 */
export interface AuthRequest extends Request {
  user?: JwtUser;
}

/**
 * プロジェクト権限チェック後のRequest型
 *
 * projectMemberには対象プロジェクトにおける
 * ユーザーのロール情報が格納される
 */
export interface ProjectRequest extends AuthRequest {
  projectMember?: ProjectMemberPayload;
}
