import type { z } from "zod";
import { Response } from "express";

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

import {
  createProjectSchema,
  getProjectsSchema,
  getProjectDetailSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  projectMemberSchema,
  projectIdSchema,
} from "../validators/project.validator.js";

import { ValidatedAuthRequest } from "../types/validated-request.js";

export const createProject = async (
  req: ValidatedAuthRequest<never, never, z.infer<typeof createProjectSchema>>,
  res: Response,
) => {
  const { name, description } = req.validatedBody!;
  const userId = req.user!.id;
  const project = await createProjectService(name, userId, description);

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getProjects = async (
  req: ValidatedAuthRequest<never, z.infer<typeof getProjectsSchema>, never>,
  res: Response,
) => {
  const result = await getProjectsService({
    userId: req.user!.id,
    query: req.validatedQuery!,
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
  const includeDeleted = req.validatedQuery!.includeDeleted;
  const project = await getProjectDatailService(id, userId, includeDeleted);

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
  const project = await updateProjectService({
    projectId: req.validatedParams!.id,
    userId: req.user!.id,
    data: req.validatedBody!,
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
  const projectId = req.validatedParams!.id;
  await deleteProjectService(projectId);

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
  const { userId, role } = req.validatedBody!;
  const projectId = req.validatedParams!.id;
  const project = await addMemberService(projectId, userId, role);

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
  const project = await getMemberService(projectId);

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
  const userId = req.validatedParams!.userId;
  const projectId = req.validatedParams!.id;

  const project = await changeMemberRoleService(projectId, userId, role);

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

  await removeMemberService(projectId, userId);

  res.sendStatus(204);
};
