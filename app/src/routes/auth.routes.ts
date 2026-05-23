import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authRegisterSchema } from "../validators/auth.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/register",
  validate({ body: authRegisterSchema }),
  asyncHandler(authController.register),
);
router.post("/login", asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));

router.get("/me", authMiddleware, asyncHandler(authController.me));

export default router;
