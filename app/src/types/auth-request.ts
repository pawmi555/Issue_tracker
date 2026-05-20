import { Request } from "express";

export interface JwtUser {
  id: number;
  role?: string;
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
