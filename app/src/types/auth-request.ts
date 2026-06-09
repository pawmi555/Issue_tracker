import { Request } from "express";
import { ProjectRoleName } from "../constants/project.constants.js";

type UserRole = "ADMIN" | "USER";

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

export interface AuthRequest extends Request {
  user?: JwtUser;
}

export interface ProjectRequest extends AuthRequest {
  projectMember?: ProjectMemberPayload;
}
