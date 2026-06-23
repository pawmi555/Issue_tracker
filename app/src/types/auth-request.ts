import { Request } from "express";
import { z } from "zod";
import { ProjectRoleName } from "../constants/project.constants.js";
import { getProjectsSchema } from "../validators/project.validator.js";
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
 * JWT認証後のユーザー情報を保持するRequest
 *
 * 認証ミドルウェアで req.user が設定される
 */
export interface AuthRequest extends Request {
  user?: JwtUser;
}

/**
 * プロジェクト権限チェック後のRequest
 *
 * projectMemberには対象プロジェクトにおける
 * ユーザーのロール情報が格納される
 */
export interface ProjectRequest extends AuthRequest {
  projectMember?: ProjectMemberPayload;
}

type GetProjectsQuery = z.infer<typeof getProjectsSchema>;

export type GetProjectsRequest = Request<
  {}, // params
  {}, // res body
  {}, // req body
  GetProjectsQuery // query
> & {
  user?: JwtUser;
  projectMember?: ProjectMemberPayload;
};
