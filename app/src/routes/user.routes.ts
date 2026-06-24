import { Router } from "express";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { adminOrSelfMiddleware } from "../middlewares/userOwnerMiddleware.js";

import {
  userIdSchema,
  getUsersSchema,
  updateUserSchema,
} from "../validators/user.validation.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  adminMiddleware,
  validate({ query: getUsersSchema }),
  asyncHandler(getUsers),
);

router.get(
  "/:id",
  validate({ params: userIdSchema }),
  adminOrSelfMiddleware,
  asyncHandler(getUserById),
);

router.patch(
  "/:id",
  validate({ params: userIdSchema, body: updateUserSchema }),
  adminMiddleware,
  asyncHandler(updateUser),
);

router.delete(
  "/:id",
  validate({ params: userIdSchema }),
  adminOrSelfMiddleware,
  asyncHandler(deleteUser),
);

export default router;
