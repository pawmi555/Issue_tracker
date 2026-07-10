import { ProjectDto } from "../../dto/project/project.dto.js";
import { mapProjectMember } from "./project-member-mapper.js";

type ProjectMapperInput = {
  id: number;
  ownerId: number;

  name: string;
  description: string | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  owner: {
    id: number;
    name: string;
    email: string;
  };

  members: {
    id: number;

    createdAt: Date;
    updatedAt: Date;

    user: {
      id: number;
      name: string;
      email: string;
    };

    role: {
      id: number;
      name: string;
      label: string;
    };
  }[];

  _count: {
    members: number;
    issues: number;
  };
};

/**
 * Project → ProjectDto
 */
export const mapProject = (
  project: ProjectMapperInput,
  options?: {
    includeDeleted?: boolean;
  },
): ProjectDto => ({
  id: project.id,
  name: project.name,
  description: project.description,

  ownerId: project.ownerId,

  owner: {
    id: project.owner.id,
    name: project.owner.name,
  },

  counts: {
    members: project._count.members,
    issues: project._count.issues,
  },

  createdAt: project.createdAt,
  updatedAt: project.updatedAt,

  ...(options?.includeDeleted && {
    deletedAt: project.deletedAt,
  }),

  members: project.members.map(mapProjectMember),
});
