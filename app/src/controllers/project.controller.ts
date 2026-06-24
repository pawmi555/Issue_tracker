//TODO:ValidatedRequestへ統一

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

import { ProjectRequest, GetProjectsRequest } from "../types/auth-request.js";

export const createProject = async (req: ProjectRequest, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user!.id;
  const project = await createProjectService(name, userId, description);

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getProjects = async (req: GetProjectsRequest, res: Response) => {
  const userId = req.user!.id;
  const result = await getProjectsService({ userId, query: req.query });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getProjectDetail = async (req: ProjectRequest, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const project = await getProjectDatailService(id, userId);

  res.json({
    success: true,
    data: project,
  });
};

export const updateProject = async (req: ProjectRequest, res: Response) => {
  const projectId = Number(req.params.id);
  const project = await updateProjectService({
    projectId,
    userId: req.user!.id,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const deleteProject = async (req: ProjectRequest, res: Response) => {
  const id = Number(req.params.id);
  await deleteProjectService(id);

  res.sendStatus(204);
};

export const addMember = async (req: ProjectRequest, res: Response) => {
  const { userId, role } = req.body;
  const projectId = Number(req.params.id);
  const project = await addMemberService(projectId, userId, role);

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getMembers = async (req: ProjectRequest, res: Response) => {
  const projectId = Number(req.params.id);
  const project = await getMemberService(projectId);

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const authorityChange = async (req: ProjectRequest, res: Response) => {
  const { role } = req.body;
  const userId = Number(req.params.userId);
  const projectId = Number(req.params.id);

  const project = await changeMemberRoleService(projectId, userId, role);

  res.json({
    success: true,
    data: project,
  });
};

export const removeMember = async (req: ProjectRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const projectId = Number(req.params.id);

  await removeMemberService(projectId, userId);

  res.sendStatus(204);
};
