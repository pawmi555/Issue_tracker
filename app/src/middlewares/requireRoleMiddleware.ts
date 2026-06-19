import { Response, NextFunction } from "express";
import { hasProjectRole } from "../utils/role-check.js";
import { ProjectRoleName } from "../constants/project.constants.js";
import { ProjectRequest } from "../types/auth-request.js";
import { AppError } from "../utils/app-error.js";

/**
 * 指定ロール以上のプロジェクト権限を要求する認可ミドルウェアを生成する。
 *
 * 前提:
 * - `req.projectMember` が事前ミドルウェアで設定済みであること
 *
 * 動作:
 * - memberRole >= minimumRole → 次の処理へ進む
 * - 権限不足またはメンバー未設定 → 403エラー
 *
 * @param minimumRole 要求する最低ロール
 * @returns Expressミドルウェア
 */

export const requireRole =
  (minimumRole: ProjectRoleName) =>
  (req: ProjectRequest, _res: Response, next: NextFunction) => {
    const memberRole = req.projectMember?.role.name;

    if (
      !memberRole ||
      !hasProjectRole({
        memberRole,
        minimumRole,
      })
    ) {
      return next(new AppError("PROJECT_FORBIDDEN", 403, "project forbidden"));
    }

    next();
  };
