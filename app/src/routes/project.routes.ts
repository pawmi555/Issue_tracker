import { Router } from "express";

import {
  createProject,
  getProjects,
  getProjectDatail,
  updateProjectDatail,
  deleteProjectDatail,
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
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "../validators/project.validator.js";
const router = Router();

router.post(
  "/",
  validate({ body: createProjectSchema }),
  asyncHandler(createProject),
);

router.get("/", asyncHandler(getProjects));

router.get(
  "/:id",
  projectRoleMiddleware("VIEWER"),
  asyncHandler(getProjectDatail),
);

router.patch(
  "/:id",
  projectRoleMiddleware("MANAGER"),
  validate({ body: updateProjectSchema }),
  asyncHandler(updateProjectDatail),
);

router.delete(
  "/:id",
  projectRoleMiddleware("OWNER"),
  asyncHandler(deleteProjectDatail),
);

router.post(
  "/:id/members",
  projectRoleMiddleware("MANAGER"),
  validate({ body: addMemberSchema }),
  asyncHandler(addMember),
);

router.get(
  "/:id/members",
  projectRoleMiddleware("MANAGER"),
  asyncHandler(getMembers),
);

router.patch(
  "/:id/members/:userId",
  projectRoleMiddleware("MANAGER"),
  validate({ body: updateMemberRoleSchema }),
  asyncHandler(authorityChange),
);

router.delete(
  "/:id/members/:userId",
  projectRoleMiddleware("OWNER"),
  asyncHandler(removeMember),
);

export default router;
