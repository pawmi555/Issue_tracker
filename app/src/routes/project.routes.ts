import { Router } from "express";

import * as controller from "../controllers/project.controller.js";
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
  asyncHandler(controller.createProject),
);
router.get("/", asyncHandler(controller.getProjects));
router.get(
  "/:id",
  projectRoleMiddleware("VIEWER"),
  asyncHandler(controller.getProject),
);
router.patch(
  "/:id",
  projectRoleMiddleware("MANAGER"),
  validate({ body: updateProjectSchema }),
  asyncHandler(controller.updateProject),
);
router.delete(
  "/:id",
  projectRoleMiddleware("OWNER"),
  asyncHandler(controller.deleteProject),
);

router.post(
  "/:id/members",
  projectRoleMiddleware("MANAGER"),
  validate({ body: addMemberSchema }),
  asyncHandler(controller.addMember),
);
router.get(
  "/:id/members",
  projectRoleMiddleware("MANAGER"),
  asyncHandler(controller.getMembers),
);
router.patch(
  "/:id/members/:userId",
  projectRoleMiddleware("MANAGER"),
  validate({ body: updateMemberRoleSchema }),
  asyncHandler(controller.authorityChange),
);
router.delete(
  "/:id/members/:userId",
  projectRoleMiddleware("OWNER"),
  asyncHandler(controller.removeMember),
);

export default router;
