import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/auth-request.js";

/**
 * Project権限チェック middleware
 */

const ROLE_HIERARCHY = {
  OWNER: 4,
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1,
} as const;

type ProjectRoleName = keyof typeof ROLE_HIERARCHY;

export const projectRoleMiddleware =
  (requiredRole: ProjectRoleName) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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

      //
      // ログインユーザーの権限
      //
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

      if (currentUser.role.name === "ADMIN") {
        return next();
      }

      //
      // 対象プロジェクトに所属しているか
      //
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

      //
      // 論理削除済みプロジェクトチェック
      //
      if (membership.project.deletedAt) {
        return res.status(404).json({
          success: false,
          code: "PROJECT_NOT_FOUND",
          message: "プロジェクトが見つかりません",
        });
      }

      const userRole = membership.role.name as ProjectRoleName;

      const hasPermission =
        ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_PROJECT_ROLE",
          message: "アクセス権限なし",
        });
      }

      //
      // optional cache
      //
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
