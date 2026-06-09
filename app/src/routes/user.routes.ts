import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { adminOrSelfMiddleware } from "../middlewares/userOwnerMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", adminMiddleware, asyncHandler(userController.getUsers));

router.get(
  "/:id",
  adminOrSelfMiddleware,
  asyncHandler(userController.getUserById),
);

router.patch(
  "/:id",
  adminOrSelfMiddleware,
  asyncHandler(userController.updateUser),
);

router.delete(
  "/:id",
  adminOrSelfMiddleware,
  asyncHandler(userController.deleteUser),
);

export default router;
