import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";

export const getUsers = async (req: Request, res: Response) => {
  const users = await getUsersService(req.query);

  res.status(200).json({
    success: true,
    data: users,
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await getUserByIdService(id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const user = await updateUserService({
    id,
    operatedBy: req.user!.id,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteUserService(id);

  res.sendStatus(204);
};
