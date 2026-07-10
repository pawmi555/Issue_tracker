import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

import { type ProjectRoleName } from "../constants/project.constants.js";

import { AppError } from "../utils/app-error.js";
import { buildPagination } from "../utils/pagination.js";
import { buildProjectHistories } from "../utils/history.utils.js";
import { mapProject } from "../mappers/project/project.mapper.js";
import { mapProjectSummary } from "../mappers/project/project-summary.mapper.js";
import {
  projectDtoSelect,
  projectSummarySelect,
  projectHistorySelect,
} from "../selects/project.select.js";
import { mapProjectMember } from "../mappers/project/project-member-mapper.js";
import { hasProjectRole, isProjectRoleName } from "../utils/role-check.js";

import { buildPaginationMeta } from "../utils/pagination-meta.js";

export type GetProjectsInput = {
  userId: number;

  query: {
    page: number;
    limit: number;
    includeDeleted: boolean;
  };
};

type UpdateProjectsInput = {
  projectId: number;
  userId: number;
  data: {
    name: string;
    description?: string;
  };
};

/**
 * Project作成
 * - projects 作成
 * - project_members に OWNER 自動追加
 * - project_histories に作成履歴を記録
 */
export const createProjectService = async (
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

        select: projectDtoSelect,
      });

      return mapProject(project);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new AppError(
          "Project name already exists",
          409,
          "PROJECT_EXISTS",
        );
      }
    }

    throw error;
  }
};

/**
 * 自分が所属するProject一覧取得
 */
export const getProjectsService = async ({
  userId,
  query,
}: GetProjectsInput) => {
  // ページネーション設定
  const { skip, take, page, limit } = buildPagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.ProjectWhereInput = {
    members: {
      some: {
        userId,
      },
    },

    ...(query.includeDeleted
      ? {}
      : {
          deletedAt: null,
        }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,

      skip,
      take,

      orderBy: {
        createdAt: "desc",
      },

      select: projectSummarySelect,
    }),

    // プロジェクトカウント
    prisma.project.count({
      where,
    }),
  ]);

  return {
    data: projects.map((project) =>
      mapProjectSummary(project, {
        includeDeleted: query.includeDeleted,
      }),
    ),

    meta: buildPaginationMeta({
      page,
      limit,
      total,
    }),
  };
};

/**
 * Project詳細取得
 */
export const getProjectDatailService = async (
  id: number,
  userId: number,
  includeDeleted = false,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id,

      ...(includeDeleted
        ? {}
        : {
            deletedAt: null,
          }),

      members: {
        some: {
          userId,
        },
      },
    },

    select: projectDtoSelect,
  });

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  return mapProject(project, {
    includeDeleted,
  });
};

/**
 * Project更新
 */
export const updateProjectService = async ({
  projectId,
  userId,
  data,
}: UpdateProjectsInput) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const HISTORY_ACTION_UPDATE = 1;
    // Project存在確認
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      select: projectHistorySelect,
    });

    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    // Project更新権限確認
    const member = await tx.projectMember.findUnique({
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
      throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
    }

    const roleName = member.role.name;

    if (!isProjectRoleName(roleName)) {
      throw new AppError("invalid role", 500, "INVALID_ROLE");
    }

    if (
      !hasProjectRole({
        memberRole: roleName,
        minimumRole: "MANAGER",
      })
    ) {
      throw new AppError("project forbidden", 403, "PROJECT_FORBIDDEN");
    }

    // 履歴生成（メモリ）
    const histories = buildProjectHistories({
      before: {
        name: project.name,
        description: project.description,
      },

      after: data,
      projectId,
      userId,
      actionId: HISTORY_ACTION_UPDATE,
    });

    // 差分なし
    if (histories.length === 0) {
      const currentProject = await tx.project.findUnique({
        where: {
          id: projectId,
        },

        select: projectDtoSelect,
      });

      if (!currentProject) {
        throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
      }

      return mapProject(currentProject);
    }

    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data,
      select: projectDtoSelect,
    });

    await tx.projectHistory.createMany({
      data: histories,
    });

    return mapProject(updatedProject);
  });
};

/**
 * Project削除（論理削除）
 */
export const deleteProjectService = async (id: number) => {
  const result = await prisma.project.updateMany({
    where: {
      id,
      deletedAt: null,
    },

    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }
};

/**
 * メンバー追加
 */
export const addMemberService = async (
  projectId: number,
  userId: number,
  role: ProjectRoleName,
) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }
    const member = await prisma.projectMember.create({
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
        role: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    });

    return mapProjectMember(member);
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
export const getMemberService = async (projectId: number) => {
  const members = await prisma.projectMember.findMany({
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
          id: true,
          name: true,
          label: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return members.map(mapProjectMember);
};

/**
 * 権限変更
 */
export const changeMemberRoleService = async (
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

  // OWNERを他権限へ変更する場合
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

    // 最後のOWNER降格を防止
    if (ownerCount === 1) {
      throw new AppError(
        "Cannot remove last owner",
        400,
        "LAST_OWNER_FORBIDDEN",
      );
    }
  }

  const updatedMember = await prisma.projectMember.update({
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

  return mapProjectMember(updatedMember);
};

/**
 * メンバー削除
 */
export const removeMemberService = async (
  projectId: number,
  userId: number,
) => {
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

  // OWNER削除時は最後のOWNERでないことを確認
  const isRemovingOwner = member.role.name === "OWNER";

  if (isRemovingOwner) {
    // 最後のOWNER削除を防止
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

  return prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};
