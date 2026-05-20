import { prisma } from "../lib/prisma.js";
export const getUsers = async (page, limit) => {
    const skip = (page - 1) * limit;
    return prisma.user.findMany({
        where: {
            deletedAt: null
        },
        skip,
        take: limit,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    });
};
export const getUserById = async (id) => {
    return prisma.user.findUnique({
        where: {
            id,
            deletedAt: null
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
};
export const updateUser = async (id, name) => {
    return prisma.user.update({
        where: { id },
        data: { name }
    });
};
export const deleteUser = async (id) => {
    return prisma.user.update({
        where: { id },
        data: {
            deletedAt: new Date()
        }
    });
};
