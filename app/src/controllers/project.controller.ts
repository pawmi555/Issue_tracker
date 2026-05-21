import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import * as projectService from "../services/project.service.js";
import { updateMemberRoleSchema } from "../validators/project.validator.js";

export const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user!.id;

  const project = await projectService.createProject(name, userId, description);

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  console.log(req.user);
  console.log(req.user!.id);
  const userId = req.user!.id;
  const project = await projectService.getProjects(userId);

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const getProject = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  const project = await projectService.getProjectById(id, userId);

  res.json({
    success: true,
    data: project,
  });
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  const { name, description } = req.body;

  const project = await projectService.updateProject(id, name, description);

  res.json({
    success: true,
    data: project,
  });
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  await projectService.deleteProject(id);

  res.status(204).send();
};

export const addMember = async (req: AuthRequest, res: Response) => {
  const { userId, role } = req.body;
  const projectId = Number(req.params.id);

  const project = await projectService.addMember(projectId, userId, role);

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);

  const project = await projectService.getMembers(projectId);

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const authorityChange = async (req: AuthRequest, res: Response) => {
  const { role } = updateMemberRoleSchema.parse(req.body);
  const userId = Number(req.params.userId);
  const projectId = Number(req.params.id);

  const project = await projectService.changeMemberRole(
    projectId,
    userId,
    role,
  );

  res.json({
    success: true,
    data: project,
  });
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const projectId = Number(req.params.id);

  const project = await projectService.removeMember(projectId, userId);

  res.status(200).json({
    success: true,
    data: project,
  });
};
