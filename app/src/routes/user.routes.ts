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
  getUserDetailSchema,
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
  adminOrSelfMiddleware,
  validate({ params: userIdSchema, query: getUserDetailSchema }),
  asyncHandler(getUserById),
);

router.patch(
  "/:id",
  adminMiddleware,
  validate({ params: userIdSchema, body: updateUserSchema }),
  asyncHandler(updateUser),
);

router.delete(
  "/:id",
  adminOrSelfMiddleware,
  validate({ params: userIdSchema }),
  asyncHandler(deleteUser),
);

export default router;
