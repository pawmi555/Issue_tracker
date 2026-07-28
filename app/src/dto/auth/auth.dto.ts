import type { UserDto } from "../user/user.dto.js";

/**
 * ログインAPIレスポンス
 */
export interface LoginResponseDto {
  user: UserDto;
  accessToken: string;
}

/**
 * アクセストークン再発行APIレスポンス
 */
export interface RefreshTokenDto {
  accessToken: string;
}

/**
 * ユーザー登録APIレスポンス
 */
export interface RegisterResponseDto {
  user: UserDto;
}

/**
 * 自分の情報取得APIレスポンス
 */
export type MeResponseDto = UserDto;
