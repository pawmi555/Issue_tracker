import { Response } from "express";
import { ProjectRequest } from "../types/auth-request.js";
import {
  createProjectService,
  getProjectsService,
  getProjectDatailService,
  updateProjectDatailService,
  deleteProjectService,
  addMemberService,
  getMemberService,
  changeMemberRoleService,
  removeMemberService,
} from "../services/project.service.js";
import {
  updateMemberRoleSchema,
  getProjectsSchema,
} from "../validators/project.validator.js";

export const createProjectController = async (
  req: ProjectRequest,
  res: Response,
) => {
  console.log("controller start");
  const { name, description } = req.body;
  const userId = req.user!.id;

  console.log("before service");

  const project = await createProjectService(name, userId, description);

  console.log("after service");

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getProjectsController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const query = getProjectsSchema.parse(req.query);
  const result = await getProjectsService({ userId, query });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getProjectDatailController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const project = await getProjectDatailService(id, userId);

  res.json({
    success: true,
    data: project,
  });
};

export const updateProjectDatailController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  const project = await updateProjectDatailService(id, name, description);

  res.json({
    success: true,
    data: project,
  });
};

export const deleteProjectDatailController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const id = Number(req.params.id);
  await deleteProjectService(id);

  res.status(200).json({
    success: true,
  });
};

export const addMemberController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const { userId, role } = req.body;
  const projectId = Number(req.params.id);
  const project = await addMemberService(projectId, userId, role);

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getMembersController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const projectId = Number(req.params.id);
  const project = await getMemberService(projectId);

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const authorityChangeController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const { role } = updateMemberRoleSchema.parse(req.body);
  const userId = Number(req.params.userId);
  const projectId = Number(req.params.id);

  const project = await changeMemberRoleService(projectId, userId, role);

  res.json({
    success: true,
    data: project,
  });
};

export const removeMemberController = async (
  req: ProjectRequest,
  res: Response,
) => {
  const userId = Number(req.params.userId);
  const projectId = Number(req.params.id);

  const project = await removeMemberService(projectId, userId);

  res.status(200).json({
    success: true,
    data: project,
  });
};
