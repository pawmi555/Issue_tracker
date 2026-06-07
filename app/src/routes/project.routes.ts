import { Router } from "express";

import {
  createProjectController,
  getProjectsController,
  getProjectDatailController,
  updateProjectDatailController,
  deleteProjectDatailController,
  addMemberController,
  getMembersController,
  authorityChangeController,
  removeMemberController,
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
  asyncHandler(createProjectController),
);

router.get("/", asyncHandler(getProjectsController));

router.get(
  "/:id",
  projectRoleMiddleware("VIEWER"),
  asyncHandler(getProjectDatailController),
);

router.patch(
  "/:id",
  projectRoleMiddleware("MANAGER"),
  validate({ body: updateProjectSchema }),
  asyncHandler(updateProjectDatailController),
);

router.delete(
  "/:id",
  projectRoleMiddleware("OWNER"),
  asyncHandler(deleteProjectDatailController),
);

router.post(
  "/:id/members",
  projectRoleMiddleware("MANAGER"),
  validate({ body: addMemberSchema }),
  asyncHandler(addMemberController),
);

router.get(
  "/:id/members",
  projectRoleMiddleware("MANAGER"),
  asyncHandler(getMembersController),
);

router.patch(
  "/:id/members/:userId",
  projectRoleMiddleware("MANAGER"),
  validate({ body: updateMemberRoleSchema }),
  asyncHandler(authorityChangeController),
);

router.delete(
  "/:id/members/:userId",
  projectRoleMiddleware("OWNER"),
  asyncHandler(removeMemberController),
);

export default router;
