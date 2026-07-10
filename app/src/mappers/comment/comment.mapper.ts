import { Prisma } from "@prisma/client";

import { CommentDto } from "../../dto/comment/comment.dto.js";
import { commentDtoSelect } from "../../selects/comment.select.js";

export type CommentMapperInput = Prisma.CommentGetPayload<{
  select: typeof commentDtoSelect;
}>;

/**
 * Comment → CommentDto
 */
export const mapComment = (
  comment: CommentMapperInput,
  options?: {
    includeDeleted?: boolean;
  },
): CommentDto => {
  return {
    id: comment.id,

    content: comment.content,

    user: {
      id: comment.user.id,
      name: comment.user.name,
    },

    createdAt: comment.createdAt,

    updatedAt: comment.updatedAt,

    ...(options?.includeDeleted && {
      deletedAt: comment.deletedAt,
    }),
  };
};
