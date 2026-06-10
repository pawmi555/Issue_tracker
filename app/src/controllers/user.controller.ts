import { Request, Response } from "express";
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

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  const user = await updateUserService(id, name);

  res.json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteUserService(id);

  res.sendStatus(204);
};
