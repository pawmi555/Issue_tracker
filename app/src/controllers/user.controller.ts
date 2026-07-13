import type { z } from "zod";
import type { Response } from "express";

import type {
  ValidatedRequest,
  ValidatedAuthRequest,
} from "../types/validated-request.js";

import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";

import type {
  userIdSchema,
  getUsersSchema,
  getUserDetailSchema,
  updateUserSchema,
} from "../validators/user.validation.js";

export const getUsers = async (
  req: ValidatedRequest<never, z.infer<typeof getUsersSchema>, never>,
  res: Response,
) => {
  const query = req.validatedQuery!;

  const users = await getUsersService(query);

  res.status(200).json({
    success: true,
    ...users,
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
  const id = req.validatedParams!.id;
  const query = req.validatedQuery!;

  const user = await getUserByIdService({
    id,
    includeDeleted: query.includeDeleted,
  });

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
  const id = req.validatedParams!.id;
  const operatedBy = req.user!.id;
  const data = req.validatedBody!;

  const user = await updateUserService({
    id,
    operatedBy,
    data,
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
  const id = req.validatedParams!.id;

  await deleteUserService({ id });

  res.sendStatus(204);
};
