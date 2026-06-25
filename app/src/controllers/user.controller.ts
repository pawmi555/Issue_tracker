import type { z } from "zod";
import { Response } from "express";

import {
  ValidatedRequest,
  ValidatedAuthRequest,
} from "../types/validated-request.js";

import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";

import {
  userIdSchema,
  getUsersSchema,
  getUserDetailSchema,
  updateUserSchema,
} from "../validators/user.validation.js";

export const getUsers = async (
  req: ValidatedRequest<never, z.infer<typeof getUsersSchema>, never>,
  res: Response,
) => {
  const users = await getUsersService(req.validatedQuery!);

  res.status(200).json({
    success: true,
    data: users,
  });
};

export const getUserById = async (
  req: ValidatedRequest<
    z.infer<typeof userIdSchema>,
    z.infer<typeof getUserDetailSchema>,
    never
  >,
  res: Response,
) => {
  const user = await getUserByIdService(
    req.validatedParams!.id,
    req.validatedQuery!.includeDeleted,
  );

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const updateUser = async (
  req: ValidatedAuthRequest<
    z.infer<typeof userIdSchema>,
    never,
    z.infer<typeof updateUserSchema>
  >,
  res: Response,
) => {
  const user = await updateUserService({
    id: req.validatedParams!.id,
    operatedBy: req.user!.id,
    data: req.validatedBody!,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (
  req: ValidatedAuthRequest<z.infer<typeof userIdSchema>, never, never>,
  res: Response,
) => {
  await deleteUserService(req.validatedParams!.id);

  res.sendStatus(204);
};
