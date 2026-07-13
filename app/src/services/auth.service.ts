import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/app-error.js";

import { mapUser } from "../mappers/user/user.mapper.js";
import {
  mapRegisterResponse,
  mapLoginResponse,
  mapRefreshToken,
} from "../mappers/auth/auth.mapper.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RefreshInput = {
  refreshToken: string;
};

type LogoutInput = {
  refreshToken: string;
};

type meInput = {
  userId: number;
};

type JwtPayload = {
  userId: number;
  jti: string;
};

const ACCESS_EXPIRES = "1h";
const REFRESH_EXPIRES = "7d";
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

const createExpiresAt = () => new Date(Date.now() + REFRESH_EXPIRES_MS);

const createAccessToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_EXPIRES,
  });
};

const createRefreshToken = (userId: number) => {
  const jti = uuid();
  const token = jwt.sign({ userId, jti }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_EXPIRES,
  });

  return {
    token,
    jti,
  };
};

const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw new AppError("Invalid token", 401, "INVALID_TOKEN");
  }
};

const hashString = async (token: string) => {
  return bcrypt.hash(token, 10);
};

/**
 * ユーザー登録
 * 初期ロールとしてUSERを付与する
 */
export const registerService = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists) throw new AppError("Email already exists", 409, "EMAIL_EXISTS");

  const passwordHash = await hashString(password);

  // USERロールはseedで投入済みであることを前提とする
  const userRole = await prisma.userRole.findUnique({
    where: { name: "USER" },
  });

  if (!userRole) {
    throw new AppError("Role not initialized", 500, "ROLE_NOT_INITIALIZED");
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash, roleId: userRole.id },
    include: {
      role: true,
    },
  });

  return mapRegisterResponse(user);
};

/**
 * ログイン
 */
export const loginService = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  if (!user)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const accessToken = createAccessToken(user.id);
  const { token, jti } = createRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      jti,
      tokenHash: await hashString(token),
      expiresAt: createExpiresAt(),
    },
  });
  return { dto: mapLoginResponse(user, accessToken), refreshToken: token };
};

/**
 * アクセストークン更新
 * Refresh Token Rotationを行う
 */
export const refreshService = async ({ refreshToken }: RefreshInput) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, "TOKEN_REQUIRED");
  }

  const { userId, jti } = verifyRefreshToken(refreshToken);

  const current = await prisma.refreshToken.findUnique({
    where: {
      jti,
    },
  });

  if (!current) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (current.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    throw new AppError(
      "Refresh token reuse detected",
      401,
      "TOKEN_REUSE_DETECTED",
    );
  }

  if (current.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401, "TOKEN_EXPIRED");
  }

  const match = await bcrypt.compare(refreshToken, current.tokenHash);

  if (!match) throw new AppError("Invalid", 401, "INVALID_REFRESH_TOKEN");

  const accessToken = createAccessToken(userId);

  const next = createRefreshToken(userId);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // rotation（使ったtokenは無効化）
    await tx.refreshToken.update({
      where: { id: current.id },
      data: { revokedAt: new Date(), replacedByTokenId: next.jti },
    });

    await tx.refreshToken.create({
      data: {
        userId,
        jti: next.jti,
        tokenHash: await hashString(next.token),
        expiresAt: createExpiresAt(),
      },
    });
  });

  return {
    dto: mapRefreshToken(accessToken),
    refreshToken: next.token,
  };
};

/**
 * ログアウト
 */
export const logoutService = async ({ refreshToken }: LogoutInput) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, "TOKEN_REQUIRED");
  }

  const payload = jwt.decode(refreshToken);

  if (!payload || typeof payload !== "object" || !("jti" in payload)) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const jti = String(payload.jti);

  // TODO:
  // 現在は全端末ログアウト。
  // 将来的には使用中のRefresh Tokenのみ無効化する実装へ変更する。
  await prisma.refreshToken.updateMany({
    where: {
      jti,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
  return;
};

/**
 * 自分の情報取得
 */
export const meService = async ({ userId }: meInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return mapUser(user);
};
