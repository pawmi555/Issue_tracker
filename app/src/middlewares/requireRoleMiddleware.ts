import { Response, NextFunction } from "express";
import { hasProjectRole } from "../utils/role-check.js";
import { ProjectRoleName } from "../constants/project.constants.js";
import { ProjectRequest } from "../types/auth-request.js";
import { AppError } from "../utils/app-error.js";

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
