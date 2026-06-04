import { Request } from "express";

type UserRole = "ADMIN" | "USER";

export interface JwtUser {
  id: number;
}

export interface ProjectMemberPayload {
  id: number;

  role: {
    name: string;
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
