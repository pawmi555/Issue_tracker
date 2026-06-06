import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { AuthRequest } from "../types/auth-request.js";

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

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);

  res.status(200).json({
    success: true,
    data: tokens,
  });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  console.log("logout token:", refreshToken);
  await authService.logout(refreshToken);

  res.status(200).json({
    success: true,
  });
};

export const me = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const project = await authService.me(userId);

  res.status(200).json({
    success: true,
    data: project,
  });
};
