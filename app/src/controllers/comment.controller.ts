import type { z } from "zod";
import type { Response } from "express";

import {
  createCommentsService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service.js";

import type {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
  issueIdSchema,
  commentIdSchema,
} from "../validators/comment.validators.js";

import type { ValidatedAuthRequest } from "../types/validated-request.js";

export const createComment = async (
  req: ValidatedAuthRequest<
    z.infer<typeof issueIdSchema>,
    never,
    z.infer<typeof createCommentSchema>
  >,
  res: Response,
) => {
  const issueId = req.validatedParams!.id;
  const userId = req.user!.id;
  const { content } = req.validatedBody!;

  const comment = await createCommentsService({
    issueId,
    userId,
    content,
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
  const issueId = req.validatedParams!.id;
  const userId = req.user!.id;
  const query = req.validatedQuery!;

  const result = await getCommentsService({
    issueId,
    userId,
    includeDeleted: query.includeDeleted,
    query,
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
  const commentId = req.validatedParams!.id;
  const userId = req.user!.id;
  const data = req.validatedBody!;

  const comment = await updateCommentService({
    commentId,
    userId,
    data,
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
  const commentId = req.validatedParams!.id;
  const userId = req.user!.id;

  await deleteCommentService({
    commentId,
    userId,
  });

  res.sendStatus(204);
};
