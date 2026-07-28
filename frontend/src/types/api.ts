import type { PaginationMeta } from "./pagination";

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiPaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: PaginationMeta;
};

export type ApiValidationError = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  code: string;
  message: string;
  errors?: ApiValidationError[];
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
