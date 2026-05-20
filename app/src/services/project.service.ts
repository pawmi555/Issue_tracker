import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

/**
 * Project作成
 * - projects 作成
 * - project_members に OWNER 自動追加
 */

type ProjectRoleName = "OWNER" | "MANAGER" | "MEMBER" | "VIEWER";

export const createProject = async (
  name: string,
  userId: number,
  description?: string,
) => {
  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const project = await tx.project.create({
        data: {
          name,
          description,
          ownerId: userId,

          members: {
            create: {
              user: {
                connect: {
                  id: userId,
                },
              },

              role: {
                connect: {
                  name: "OWNER",
                },
              },
            },
          },
        },

        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },

              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          _count: {
            select: {
              members: true,
              issues: true,
            },
          },
        },
      });

      return project;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Project name already exists", 409, "PROJECT_EXISTS");
    }

    throw error;
  }
};

/**
 * 自分が所属するProject一覧取得
 */
export const getProjects = async (userId: number) => {
  return prisma.project.findMany({
    where: {
      deletedAt: null,
      members: {
        some: {
          userId,
          role: {
            name: {
              in: ["OWNER", "MANAGER", "MEMBER", "VIEWER"],
            },
          },
        },
      },
    },

    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          issues: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Project詳細取得
 */
export const getProjectById = async (id: number, userId: number) => {
  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  return project;
};

/**
 * Project更新
 */
export const updateProject = async (
  id: number,
  name: string,
  description?: string,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  return prisma.project.update({
    where: { id },
    data: {
      name,
      description,
    },
  });
};

/**
 * Project削除（論理削除）
 */
export const deleteProject = async (id: number) => {
  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }
  return prisma.project.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

/**
 * メンバー追加
 */
export const addMember = async (
  projectId: number,
  userId: number,
  role: ProjectRoleName,
) => {
  try {
    return await prisma.projectMember.create({
      data: {
        project: {
          connect: {
            id: projectId,
          },
        },

        user: {
          connect: {
            id: userId,
          },
        },

        role: {
          connect: {
            name: role,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("User already joined", 409, "USER_ALREADY_JOINED");
    }

    throw error;
  }
};

/**
 * メンバー一覧取得
 */
export const getMembers = async (projectId: number) => {
  return prisma.projectMember.findMany({
    where: {
      projectId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      role: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

/**
 * 権限変更
 */
export const changeMemberRole = async (
  projectId: number,
  userId: number,
  role: ProjectRoleName,
) => {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    include: {
      role: true,
    },
  });

  if (!member) {
    throw new AppError(
      "Project member not found",
      404,
      "PROJECT_MEMBER_NOT_FOUND",
    );
  }

  const isRemovingOwner = member.role.name === "OWNER" && role !== "OWNER";

  if (isRemovingOwner) {
    const ownerCount = await prisma.projectMember.count({
      where: {
        projectId,

        role: {
          name: "OWNER",
        },
      },
    });

    if (ownerCount === 1) {
      throw new AppError(
        "Cannot remove last owner",
        400,
        "LAST_OWNER_FORBIDDEN",
      );
    }
  }
  return prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      role: {
        connect: {
          name: role,
        },
      },
    },

    include: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * メンバー削除
 */
export const removeMember = async (projectId: number, userId: number) => {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!member) {
    throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
  }

  if (member.role.name === "OWNER") {
    throw new AppError("Cannot remove owner", 400, "OWNER_REMOVE_FORBIDDEN");
  }
  return prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};
