import type { z } from "zod";
import { Response } from "express";

import {
  createCommentsService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service.js";

import {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
  issueIdSchema,
  commentIdSchema,
} from "../validators/comment.validators.js";

import { ValidatedAuthRequest } from "../types/validated-request.js";

export const createComment = async (
  req: ValidatedAuthRequest<
    z.infer<typeof issueIdSchema>,
    never,
    z.infer<typeof createCommentSchema>
  >,
  res: Response,
) => {
  const comment = await createCommentsService({
    issueId: req.validatedParams!.id,
    userId: req.user!.id,
    content: req.validatedBody!.content,
  });

  res.status(201).json({
    success: true,
    data: comment,
  });
};

export const getComments = async (
  req: ValidatedAuthRequest<
    z.infer<typeof issueIdSchema>,
    z.infer<typeof getCommentsSchema>,
    never
  >,
  res: Response,
) => {
  const result = await getCommentsService({
    issueId: req.validatedParams!.id,
    userId: req.user!.id,
    includeDeleted: req.validatedQuery!.includeDeleted,
    query: req.validatedQuery!,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const updateComment = async (
  req: ValidatedAuthRequest<
    z.infer<typeof commentIdSchema>,
    never,
    z.infer<typeof updateCommentSchema>
  >,
  res: Response,
) => {
  const comment = await updateCommentService({
    commentId: req.validatedParams!.id,
    userId: req.user!.id,
    data: req.validatedBody!,
  });

  res.status(200).json({
    success: true,
    data: comment,
  });
};

export const deleteComment = async (
  req: ValidatedAuthRequest<z.infer<typeof commentIdSchema>, never, never>,
  res: Response,
) => {
  await deleteCommentService({
    commentId: req.validatedParams!.id,
    userId: req.user!.id,
  });

  res.sendStatus(204);
};
