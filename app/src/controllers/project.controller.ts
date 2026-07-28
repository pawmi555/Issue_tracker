import type { z } from "zod";
import type { Response } from "express";

import {
  createProjectService,
  getProjectsService,
  getProjectDatailService,
  updateProjectService,
  deleteProjectService,
  addMemberService,
  getMemberService,
  changeMemberRoleService,
  removeMemberService,
} from "../services/project.service.js";

import type {
  createProjectSchema,
  getProjectsSchema,
  getProjectDetailSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  projectMemberSchema,
  projectIdSchema,
} from "../validators/project.validator.js";

import type { ValidatedAuthRequest } from "../types/validated-request.js";

export const createProject = async (
  req: ValidatedAuthRequest<never, never, z.infer<typeof createProjectSchema>>,
  res: Response,
) => {
  const { name, description } = req.validatedBody!;
  const userId = req.user!.id;

  const project = await createProjectService({ name, userId, description });

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getProjects = async (
  req: ValidatedAuthRequest<never, z.infer<typeof getProjectsSchema>, never>,
  res: Response,
) => {
  const userId = req.user!.id;
  const query = req.validatedQuery!;

  const result = await getProjectsService({
    userId,
    query,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getProjectDetail = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectIdSchema>,
    z.infer<typeof getProjectDetailSchema>,
    never
  >,
  res: Response,
) => {
  const userId = req.user!.id;
  const id = req.validatedParams!.id;
  const query = req.validatedQuery!;

  const project = await getProjectDatailService({
    id,
    userId,
    includeDeleted: query.includeDeleted,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const updateProject = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectIdSchema>,
    never,
    z.infer<typeof updateProjectSchema>
  >,
  res: Response,
) => {
  const projectId = req.validatedParams!.id;
  const userId = req.user!.id;
  const data = req.validatedBody!;

  const project = await updateProjectService({
    projectId,
    userId,
    data,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const deleteProject = async (
  req: ValidatedAuthRequest<z.infer<typeof projectIdSchema>, never, never>,
  res: Response,
) => {
  const id = req.validatedParams!.id;

  await deleteProjectService({ id });

  res.sendStatus(204);
};

export const addMember = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectIdSchema>,
    never,
    z.infer<typeof addMemberSchema>
  >,
  res: Response,
) => {
  const { userId: targetUserId, role } = req.validatedBody!;
  const projectId = req.validatedParams!.id;
  const actorUserId = req.user!.id;

  const project = await addMemberService({
    projectId,
    actorUserId,
    targetUserId,
    role,
  });

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getMembers = async (
  req: ValidatedAuthRequest<z.infer<typeof projectIdSchema>, never, never>,
  res: Response,
) => {
  const projectId = req.validatedParams!.id;
  const project = await getMemberService({ projectId });

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const authorityChange = async (
  req: ValidatedAuthRequest<
    z.infer<typeof projectMemberSchema>,
    never,
    z.infer<typeof updateMemberRoleSchema>
  >,
  res: Response,
) => {
  const { role } = req.validatedBody!;
  const targetUserId = req.validatedParams!.userId;
  const projectId = req.validatedParams!.id;
  const actorUserId = req.user!.id;

  const project = await changeMemberRoleService({
    projectId,
    actorUserId,
    targetUserId,
    role,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const removeMember = async (
  req: ValidatedAuthRequest<z.infer<typeof projectMemberSchema>, never, never>,
  res: Response,
) => {
  const userId = req.validatedParams!.userId;
  const projectId = req.validatedParams!.id;

  await removeMemberService({ projectId, userId });

  res.sendStatus(204);
};
