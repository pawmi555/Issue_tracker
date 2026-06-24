import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import {
  authRegisterSchema,
  authLoginSchema,
} from "../validators/auth.validators.js";

const router = Router();

router.post(
  "/register",
  validate({ body: authRegisterSchema }),
  asyncHandler(register),
);

router.post("/login", validate({ body: authLoginSchema }), asyncHandler(login));

router.post("/refresh", asyncHandler(refresh));

router.post("/logout", asyncHandler(logout));

router.get("/me", authMiddleware, asyncHandler(me));

export default router;
