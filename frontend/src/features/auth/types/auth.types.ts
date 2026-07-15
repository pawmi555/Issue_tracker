import type { IsoDateString } from "../../../types/common";

export type UserRoleName = "ADMIN" | "USER";

export type Role = {
  id: number;
  name: UserRoleName;
  label: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  deletedAt?: IsoDateString | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: AuthUser;
};
