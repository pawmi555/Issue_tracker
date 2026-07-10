import type { z } from "zod";
import { Request, Response } from "express";

import { refreshCookie } from "../config/cookie.js";

import {
  registerService,
  loginService,
  refreshService,
  logoutService,
  meService,
} from "../services/auth.service.js";

import {
  authRegisterSchema,
  authLoginSchema,
} from "../validators/auth.validators.js";

import { ValidatedRequest } from "../types/validated-request.js";

import { AuthRequest } from "../types/auth-request.js";

export const register = async (
  req: ValidatedRequest<never, never, z.infer<typeof authRegisterSchema>>,
  res: Response,
) => {
  const { name, email, password } = req.validatedBody!;

  const result = await registerService(name, email, password);

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const login = async (
  req: ValidatedRequest<never, never, z.infer<typeof authLoginSchema>>,
  res: Response,
) => {
  const { email, password } = req.validatedBody!;

  const result = await loginService(email, password);

  res.cookie("refresh_token", result.refreshToken, refreshCookie);

  res.status(200).json({
    success: true,
    data: result.dto,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refresh_token;

  const result = await refreshService(token);

  res.cookie("refresh_token", result.refreshToken, refreshCookie);

  res.status(200).json({
    success: true,
    data: result.dto,
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refresh_token;

  await logoutService(token);
  res.clearCookie("refresh_token", {
    path: "/api/v1/auth",
  });

  res.sendStatus(204);
};

export const me = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await meService(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
};
