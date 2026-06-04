import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { ProjectRequest } from "../types/auth-request.js";

const ROLE_HIERARCHY = {
  OWNER: 4,
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1,
} as const;

type ProjectRoleName = keyof typeof ROLE_HIERARCHY;

/**
 * Project権限チェックMiddlewareを生成する
 *
 * 指定されたProject Role以上の権限を持つユーザーのみ
 * アクセスを許可する。
 *
 * ADMINユーザーは常に許可される。
 *
 * 認証確認、
 * Project参加確認、
 * Project削除状態確認、
 * Project Role確認を行い、
 * ProjectMember情報をreq.projectMemberへ設定する。
 *
 * @param requiredRole 必要な最低権限
 */
export const projectRoleMiddleware =
  (requiredRole: ProjectRoleName) =>
  async (req: ProjectRequest, res: Response, next: NextFunction) => {
    try {
      const authUser = req.user;

      if (!authUser) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "未認証",
        });
      }

      const projectId = Number(req.params.projectId || req.params.id);

      if (Number.isNaN(projectId)) {
        return res.status(400).json({
          success: false,
          code: "INVALID_PROJECT_ID",
          message: "無効なプロジェクトID",
        });
      }

      // ログインユーザー情報取得
      const currentUser = await prisma.user.findUnique({
        where: {
          id: authUser.id,
          deletedAt: null,
        },
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!currentUser) {
        return res.status(401).json({
          success: false,
          code: "USER_NOT_FOUND",
          message: "ユーザーが見つかりません",
        });
      }

      // ADMINはProject権限チェックをスキップ
      if (currentUser.role.name === "ADMIN") {
        return next();
      }

      // 対象プロジェクトに所属しているか
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: authUser.id,
          },
        },
        select: {
          id: true,

          role: {
            select: {
              name: true,
            },
          },

          project: {
            select: {
              id: true,
              deletedAt: true,
            },
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          code: "PROJECT_FORBIDDEN",
          message: "プロジェクト権限なし",
        });
      }

      // 論理削除済みプロジェクト確認
      if (membership.project.deletedAt) {
        return res.status(404).json({
          success: false,
          code: "PROJECT_NOT_FOUND",
          message: "プロジェクトが見つかりません",
        });
      }

      const userRole = membership.role.name as ProjectRoleName;

      // ユーザー権限が要求権限以上か判定
      const hasPermission =
        ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_PROJECT_ROLE",
          message: "アクセス権限なし",
        });
      }

      // 後続処理で利用できるようProjectMember情報を保持
      req.projectMember = membership;

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        code: "AUTHORIZATION_CHECK_FAILED",
        message: "認可チェック失敗",
      });
    }
  };
