import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { adminOrSelfMiddleware } from "../middlewares/userOwnerMiddleware.js";

const router = Router();

router.get("/", adminMiddleware, userController.getUsers);

router.get("/:id", adminOrSelfMiddleware, userController.getUserById);

router.patch("/:id", adminOrSelfMiddleware, userController.updateUser);

router.delete("/:id", adminOrSelfMiddleware, userController.deleteUser);

export default router;
