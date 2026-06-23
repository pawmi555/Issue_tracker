import { Router } from "express";

import {
  createProject,
  getProjects,
  getProjectDetail,
  updateProject,
  deleteProject,
  addMember,
  getMembers,
  authorityChange,
  removeMember,
} from "../controllers/project.controller.js";
import { projectRoleMiddleware } from "../middlewares/projectRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createProjectSchema,
  getProjectsSchema,
  getProjectDetailSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  projectIdSchema,
  projectMemberSchema,
} from "../validators/project.validator.js";
const router = Router();

router.post(
  "/",
  validate({ body: createProjectSchema }),
  asyncHandler(createProject),
);

router.get(
  "/",
  validate({ query: getProjectsSchema }),
  asyncHandler(getProjects),
);

router.get(
  "/:id",
  validate({ params: projectIdSchema, query: getProjectDetailSchema }),
  projectRoleMiddleware("VIEWER"),
  asyncHandler(getProjectDetail),
);

router.patch(
  "/:id",
  validate({ params: projectIdSchema, body: updateProjectSchema }),
  projectRoleMiddleware("MANAGER"),
  asyncHandler(updateProject),
);

router.delete(
  "/:id",
  validate({ params: projectIdSchema }),
  projectRoleMiddleware("OWNER"),
  asyncHandler(deleteProject),
);

router.post(
  "/:id/members",
  validate({ params: projectIdSchema, body: addMemberSchema }),
  projectRoleMiddleware("MANAGER"),
  asyncHandler(addMember),
);

router.get(
  "/:id/members",
  validate({ params: projectIdSchema }),
  projectRoleMiddleware("MANAGER"),
  asyncHandler(getMembers),
);

router.patch(
  "/:id/members/:userId",
  validate({ params: projectMemberSchema, body: updateMemberRoleSchema }),
  projectRoleMiddleware("MANAGER"),
  asyncHandler(authorityChange),
);

router.delete(
  "/:id/members/:userId",
  validate({ params: projectMemberSchema }),
  projectRoleMiddleware("OWNER"),
  asyncHandler(removeMember),
);

export default router;
