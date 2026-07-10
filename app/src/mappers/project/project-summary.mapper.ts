import { ProjectSummaryDto } from "../../dto/project/project-summary.dto.js";

type ProjectSummaryMapperInput = {
  id: number;
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

  _count: {
    members: number;
    issues: number;
  };
};

/**
 * ProjectSummary → ProjectSummaryDto
 */
export const mapProjectSummary = (
  project: ProjectSummaryMapperInput,
  options?: {
    includeDeleted?: boolean;
  },
): ProjectSummaryDto => ({
  id: project.id,
  name: project.name,
  description: project.description,

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
});
