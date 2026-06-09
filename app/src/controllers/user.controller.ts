import { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { AuthRequest } from "../types/auth-request.js";

export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = await userService.getUsers(req.query);

  res.status(200).json({
    success: true,
    data: users,
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await userService.getUserById(id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  const user = await userService.updateUser(id, name);

  res.json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await userService.deleteUser(id);

  res.sendStatus(204);
};
