import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

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

const hashToken = async (token: string) => {
  return bcrypt.hash(token, 10);
};

const safeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

/**
 * ユーザー登録
 */
export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  console.log("register password:", password);
  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists) throw new AppError("Email already exists", 409, "EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);

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
  console.log("login email:", email);
  console.log("user:", user);
  console.log("input password:", password);
  console.log("db hash:", user.passwordHash);
  if (!user)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log("valid password:", valid);

  if (!valid)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  const tokenHash = await hashToken(refreshToken);

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
 * トークン更新
 */
export const refresh = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, "TOKEN_REQUIRED");
  }

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new AppError("Invalid token", 401, "INVALID_TOKEN");
  }

  const userId = Number(decoded.userId);

  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
    },
  });

  let matchedToken = null;

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

  // rotation（使ったtokenは無効化）
  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { revokedAt: new Date() },
  });

  const newAccessToken = createAccessToken(userId);
  const newRefreshToken = createRefreshToken(userId);

  const newHash = await hashToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
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

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new AppError("Invalid token", 401, "INVALID_TOKEN");
  }

  const userId = Number(decoded.userId);

  //userの全refresh token無効化(後で修正)
  //logoutしたtokenだけ無効化する実装へ変更予定
  //その場合、APIテスト実行時にpostmanの設定を変更する」必要あり
  // const tokens = await prisma.refreshToken.findMany({
  //   where: {
  //     userId,
  //     revokedAt: null,
  //   },
  // });

  // for (const t of tokens) {
  //   const isMatch = await bcrypt.compare(refreshToken, t.tokenHash);
  //   if (isMatch) {
  //     await prisma.refreshToken.update({
  //       where: { id: t.id },
  //       data: { revokedAt: new Date() },
  //     });
  //     return;
  //   }
  // }

  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
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
