import type { UserMapperInput } from "../user/user.mapper.js";

import { mapUser } from "../user/user.mapper.js";

import {
  LoginResponseDto,
  RefreshTokenDto,
  RegisterResponseDto,
} from "../../dto/auth/auth.dto.js";

/**
 * ユーザー登録レスポンスDTOへ変換する
 */
export const mapRegisterResponse = (
  user: UserMapperInput,
): RegisterResponseDto => ({
  user: mapUser(user),
});

/**
 * ログインレスポンスDTOへ変換する
 */
export const mapLoginResponse = (
  user: UserMapperInput,
  accessToken: string,
): LoginResponseDto => ({
  user: mapUser(user),
  accessToken,
});

/**
 * アクセストークン再発行レスポンスDTOへ変換する
 */
export const mapRefreshToken = (accessToken: string): RefreshTokenDto => ({
  accessToken,
});
