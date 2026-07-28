import apiClient, { refreshAccessToken } from "./axios";

import type { ApiSuccessResponse } from "../types/api";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "../features/auth/types/auth.types";

/**
 * ユーザー登録
 */
export const register = async (
  request: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await apiClient.post<ApiSuccessResponse<RegisterResponse>>(
    "/auth/register",
    request,
  );

  return response.data.data;
};

/**
 * ログイン
 */
export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    "/auth/login",
    request,
  );

  return response.data.data;
};

/**
 * Access Token再発行
 */
export const refresh = async (): Promise<RefreshResponse> => {
  const accessToken = await refreshAccessToken();

  return {
    accessToken,
  };
};

/**
 * ログアウト
 */
export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

/**
 * ログインユーザー取得
 */
export const getMe = async (): Promise<AuthUser> => {
  const response =
    await apiClient.get<ApiSuccessResponse<AuthUser>>("/auth/me");

  return response.data.data;
};
