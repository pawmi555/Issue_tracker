import { Request } from "express";

type UserRole = "ADMIN" | "USER";

export interface JwtUser {
  id: number;
  role: UserRole;
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
  projectMember?: ProjectMemberPayload;
}
