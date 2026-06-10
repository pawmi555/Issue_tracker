import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { adminOrSelfMiddleware } from "../middlewares/userOwnerMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", adminMiddleware, asyncHandler(getUsers));

router.get("/:id", adminOrSelfMiddleware, asyncHandler(getUserById));

router.patch("/:id", adminOrSelfMiddleware, asyncHandler(updateUser));

router.delete("/:id", adminOrSelfMiddleware, asyncHandler(deleteUser));

export default router;
