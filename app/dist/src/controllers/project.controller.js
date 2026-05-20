import * as projectService from "../services/project.service.js";
export const createProject = async (req, res) => {
    const { name, description, userId } = req.body;
    const project = await projectService.createProject(name, description, userId);
    res.status(201).json({
        success: true,
        data: project
    });
};
export const getProjects = async (req, res) => {
    const project = await projectService.getProjects();
    res.status(201).json({
        success: true,
        data: project
    });
};
export const addMember = async (req, res) => {
    const { projectId, userId, role } = req.body;
    const project = await projectService.addMember(projectId, userId, role);
    res.status(201).json({
        success: true,
        data: project
    });
};
export const getMembers = async (req, res) => {
    const { projectId } = req.body;
    const project = await projectService.getMembers(projectId);
    res.status(201).json({
        success: true,
        data: project
    });
};
export const removeMember = async (req, res) => {
    const { projectId, userId } = req.body;
    const project = await projectService.removeMember(projectId, userId);
    res.status(201).json({
        success: true,
        data: project
    });
};
