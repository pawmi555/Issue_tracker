import { Prisma } from "@prisma/client";

import { UserDto } from "../../dto/user/user.dto.js";
import { UserSummaryDto } from "../../dto/user/user-summary.dto.js";

import { userDtoSelect, userSummarySelect } from "../../selects/user.select.js";

export type UserMapperInput = Prisma.UserGetPayload<{
  select: typeof userDtoSelect;
}>;

export type UserSummaryMapperInput = Prisma.UserGetPayload<{
  select: typeof userSummarySelect;
}>;

/**
 * User → UserDto
 */
export const mapUser = (
  user: UserMapperInput,
  options?: {
    includeDeleted?: boolean;
  },
): UserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,

  role: {
    id: user.role.id,
    name: user.role.name,
    label: user.role.label,
  },

  createdAt: user.createdAt,
  updatedAt: user.updatedAt,

  ...(options?.includeDeleted && {
    deletedAt: user.deletedAt,
  }),
});

/**
 * User → UserSummaryDto
 */
export const mapUseSummary = (
  user: UserSummaryMapperInput,
  options?: {
    includeDeleted?: boolean;
  },
): UserSummaryDto => ({
  id: user.id,
  name: user.name,

  ...(options?.includeDeleted && {
    deletedAt: user.deletedAt,
  }),
});
