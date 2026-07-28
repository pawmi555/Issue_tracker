import axios from "axios";

import type { ApiErrorResponse } from "../types/api";

const defaultError: ApiErrorResponse = {
  success: false,
  code: "UNKNOWN_ERROR",
  message: "予期しないエラーが発生しました",
};

export const getApiError = (error: unknown): ApiErrorResponse => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return defaultError;
  }

  return error.response?.data ?? defaultError;
};
