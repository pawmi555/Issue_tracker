import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { AuthRequest } from "../types/auth-request.js";
import { refreshCookie } from "../config/cookie.js";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.cookie("refresh_token", result.refreshToken, refreshCookie);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refresh_token;
  const result = await authService.refresh(token);
  res.cookie("refresh_token", result.refreshToken, refreshCookie);
  res.status(200).json({
    success: true,
    data: {
      accessToken: result.accessToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refresh_token;
  await authService.logout(token);
  res.clearCookie("refresh_token", {
    path: "/api/v1/auth",
  });

  res.sendStatus(204);
};

export const me = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.me(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
};
