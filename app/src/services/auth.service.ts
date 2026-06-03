import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import type { User } from "@prisma/client";

const ACCESS_EXPIRES = "1h";
const REFRESH_EXPIRES = "7d";

const createAccessToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_EXPIRES,
  });
};

const createRefreshToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_EXPIRES,
  });
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

const safeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

type JwtPayload = {
  userId: number;
};

/**
 * ユーザー登録
 * 初期ロールとしてUSERを付与する
 */
export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists) throw new AppError("Email already exists", 409, "EMAIL_EXISTS");

  const passwordHash = await hashString(password);

  // USERロールはseedで投入済みであることを前提とする
  const userRole = await prisma.userRole.findUnique({
    where: { name: "USER" },
  });

  const user = await prisma.user.create({
    data: { name, email, passwordHash, roleId: userRole!.id },
  });

  return safeUser(user);
};

/**
 * ログイン
 */
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  const tokenHash = await hashString(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user: safeUser(user), accessToken, refreshToken };
};

/**
 * アクセストークン更新
 * Refresh Token Rotationを行う
 */
export const refresh = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, "TOKEN_REQUIRED");
  }

  const decoded = verifyRefreshToken(refreshToken);
  const userId = decoded.userId;

  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
    },
  });

  let matchedToken = null;

  // DBにはハッシュ化したRefresh Tokenを保存しているため総当たりで照合
  for (const t of tokens) {
    const isMatch = await bcrypt.compare(refreshToken, t.tokenHash);
    if (isMatch) {
      matchedToken = t;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const newAccessToken = createAccessToken(userId);
  const newRefreshToken = createRefreshToken(userId);
  const newHash = await hashString(newRefreshToken);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // rotation（使ったtokenは無効化）
    await tx.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    await tx.refreshToken.create({
      data: {
        userId,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * ログアウト
 */
export const logout = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, "TOKEN_REQUIRED");
  }

  const decoded = verifyRefreshToken(refreshToken);
  const userId = decoded.userId;

  // TODO:
  // 現在は全端末ログアウト。
  // 将来的には使用中のRefresh Tokenのみ無効化する実装へ変更する。
  await prisma.refreshToken.updateMany({
    where: {
      userId,
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
export const me = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return safeUser(user);
};
