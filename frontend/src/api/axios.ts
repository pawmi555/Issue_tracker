import axios from "axios";

import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import type { ApiSuccessResponse } from "../types/api";
import type { RefreshResponse } from "../features/auth/types/auth.types";

import { useAuthStore } from "../stores/auth.store";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

/**
 * 通常のAPI通信用クライアント
 */
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Refresh専用クライアント
 *
 * apiClientを使うとResponse Interceptorが再実行され、
 * 無限ループになる可能性があるため分離する。
 */
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

/**
 * Access Tokenを再発行する。
 *
 * 同時に複数の401が発生した場合も、
 * Refresh APIは1回だけ実行する。
 */
export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiSuccessResponse<RefreshResponse>>("/auth/refresh")
      .then((response) => {
        const { accessToken } = response.data.data;

        useAuthStore.getState().setAccessToken(accessToken);

        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

/**
 * Request Interceptor
 *
 * メモリ上のAccess TokenをAuthorization Headerへ追加する。
 */
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 *
 * Access Token失効による401の場合、
 * Refresh後に元のリクエストを一度だけ再送する。
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = originalRequest.url ?? "";

    const isPublicAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (status !== 401 || originalRequest._retry || isPublicAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();

      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
