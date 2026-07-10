import { ProjectMemberDto } from "../../dto/project/project-member.dto.js";

type ProjectMemberMapperInput = {
  id: number;

  createdAt: Date;
  updatedAt: Date;

  user: {
    id: number;
    name: string;
  };

  role: {
    id: number;
    name: string;
    label: string;
  };
};

/**
 * ProjectMember → ProjectMemberDto
 */
export const mapProjectMember = (
  member: ProjectMemberMapperInput,
): ProjectMemberDto => ({
  id: member.id,

  user: {
    id: member.user.id,
    name: member.user.name,
  },

  role: {
    id: member.role.id,
    name: member.role.name,
    label: member.role.label,
  },

  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
});
