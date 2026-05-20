import { prisma } from "../lib/prisma.js";
import { ProjectRole } from "@prisma/client";
export const createProject = async (name, userId, description) => {
    return prisma.project.create({
        data: {
            name,
            description,
            owner: {
                connect: { id: userId }
            }
        }
    });
};
export const getProjects = async () => {
    return prisma.project.findMany();
};
export const addMember = async (projectId, userId, role) => {
    return prisma.projectMember.create({
        data: {
            projectId,
            userId,
            role: ProjectRole.OWNER
        }
    });
};
export const getMembers = async (projectId) => {
    return prisma.projectMember.findMany({
        where: { projectId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
};
export const removeMember = async (projectId, userId) => {
    return prisma.projectMember.deleteMany({
        where: {
            projectId,
            userId
        }
    });
};
